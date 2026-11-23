const {createHash, randomUUID} = require('node:crypto');
const {HttpsError} = require('firebase-functions/v1/https');
const {identityFromAuth} = require('../quota/searchQuotaService');

const EXECUTION_WARNING_AFTER_MS = 90 * 1000;
// Must exceed the callable's 120-second timeout. This is not provider cancellation.
const EXECUTION_RECOVERY_AFTER_MS = 180 * 1000;
const MAX_UNCERTAIN_RECOVERIES = 2;
const MAX_CACHED_RESULT_BYTES = 700000;
const hash = (value) => createHash('sha256').update(value).digest('hex');

const canonicalize = (value) => {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.keys(value).sort()
        .map((key) => [key, canonicalize(value[key])]));
  }
  throw new HttpsError('invalid-argument',
      'Search parameters must contain valid JSON values.');
};
const executionFingerprint = (payload) => hash(JSON.stringify(canonicalize(payload)));

const createSearchExecutionService = ({db, quotaService, performSearch, clock = Date.now}) => {
  if (!db || typeof db.runTransaction !== 'function' || !quotaService ||
      typeof quotaService.reserveSearch !== 'function' || typeof performSearch !== 'function') {
    throw new TypeError('Firestore, quota service, and search provider function are required.');
  }

  const runSearch = async ({auth, requestId, action = 'new', payload}) => {
    const identity = identityFromAuth(auth);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new HttpsError('invalid-argument', 'Search parameters are required.');
    }
    const normalizedPayload = canonicalize(payload);
    const fingerprint = executionFingerprint(normalizedPayload);
    const reservation = await quotaService.reserveSearch({auth, requestId,
      action, query: normalizedPayload.query});
    const responseMetadata = {requestId,
      reservationExpiresAt: reservation.reservationExpiresAt,
      quota: reservation.quota, reservationReused: reservation.reused};
    const executionRef = db.collection('searchUsage').doc(identity.key)
        .collection('reservations').doc(hash(requestId))
        .collection('executions').doc(fingerprint);
    const attemptId = randomUUID();
    const fail = (reason, message, extra = {}, code = 'unavailable') => {
      throw new HttpsError(code, message, {...responseMetadata, reason, ...extra});
    };
    const assertContext = async (transaction) => {
      const deletion = await transaction.get(db.collection('accountDeletions').doc(identity.uid));
      if (deletion.exists) {
        fail('ACCOUNT_DELETION_IN_PROGRESS', 'Account deletion is in progress.',
            {}, 'failed-precondition');
      }
      const stored = await transaction.get(executionRef.parent.parent);
      const expiresAtMs = stored.data()?.expiresAtMs;
      if (!stored.exists || !Number.isSafeInteger(expiresAtMs) || expiresAtMs <= clock()) {
        fail('SEARCH_RESERVATION_EXPIRED', 'This search session has expired.',
            {}, 'failed-precondition');
      }
    };
    const claim = await db.runTransaction(async (transaction) => {
      await assertContext(transaction);
      const snapshot = await transaction.get(executionRef);
      let recoveryCount = 0;
      let recovered = false;
      if (snapshot.exists) {
        const execution = snapshot.data();
        if (execution.version !== 1 || execution.fingerprint !== fingerprint) {
          throw new HttpsError('internal', 'Invalid stored search execution.');
        }
        if (execution.status === 'succeeded') {
          return {cached: true, result: execution.result, recovered: false};
        }
        recoveryCount = execution.recoveryCount ?? 0;
        if (!Number.isSafeInteger(recoveryCount) || recoveryCount < 0) {
          throw new HttpsError('internal', 'Invalid stored recovery count.');
        }
        if (execution.status === 'running') {
          if (!Number.isSafeInteger(execution.startedAtMs) || execution.startedAtMs > clock()) {
            throw new HttpsError('internal', 'Invalid stored execution start time.');
          }
          const age = clock() - execution.startedAtMs;
          const retryAfterMs = Math.max(0, EXECUTION_RECOVERY_AFTER_MS - age);
          if (age < EXECUTION_RECOVERY_AFTER_MS) {
            const uncertain = age >= EXECUTION_WARNING_AFTER_MS;
            fail(uncertain ? 'SEARCH_EXECUTION_UNCERTAIN' : 'SEARCH_IN_PROGRESS',
                uncertain ? 'The previous search outcome is uncertain.' :
                  'This search is already running.',
                {retryAfterMs, recoveryAvailable: false});
          }
          if (action !== 'retry') {
            fail('SEARCH_RETRY_REQUIRED', 'Use Retry to recover this search.',
                {retryAfterMs: 0, recoveryAvailable: true});
          }
          if (recoveryCount >= MAX_UNCERTAIN_RECOVERIES) {
            fail('SEARCH_RECOVERY_LIMIT',
                'This search could not be recovered. Start a new search.',
                {recoveryAvailable: false}, 'failed-precondition');
          }
          recoveryCount += 1;
          recovered = true;
        } else if (execution.status === 'failed') {
          if (action !== 'retry') {
            fail('SEARCH_RETRY_REQUIRED', 'The previous search failed. Use Retry.');
          }
        } else {
          throw new HttpsError('internal', 'Unknown stored search execution status.');
        }
      }
      transaction.set(executionRef, {version: 1, fingerprint, status: 'running',
        attemptId, recoveryCount, startedAtMs: clock(),
        reservationExpiresAt: reservation.reservationExpiresAt});
      return {cached: false, recovered};
    });
    if (claim.cached) {
      return {...claim.result, ...responseMetadata, cached: true, recovered: false};
    }
    const assertOwnership = (snapshot) => {
      const current = snapshot.data();
      if (!snapshot.exists || current.status !== 'running' || current.attemptId !== attemptId) {
        fail('SEARCH_EXECUTION_SUPERSEDED',
            'A newer attempt owns this search. Use Retry to retrieve its result.',
            {}, 'failed-precondition');
      }
    };
    const isStateError = (error) => [
      'ACCOUNT_DELETION_IN_PROGRESS', 'SEARCH_RESERVATION_EXPIRED',
      'SEARCH_EXECUTION_SUPERSEDED',
    ].includes(error?.details?.reason);
    let result;
    try {
      const providerResult = await performSearch(normalizedPayload);
      if (!providerResult || typeof providerResult !== 'object' ||
          Array.isArray(providerResult) || !Array.isArray(providerResult.results)) {
        throw new Error('Search returned an invalid response.');
      }
      result = canonicalize(providerResult);
      if (Buffer.byteLength(JSON.stringify(result), 'utf8') > MAX_CACHED_RESULT_BYTES) {
        throw new Error('Search response exceeds the cache size limit.');
      }
    } catch (error) {
      console.error('Search execution failed:', {requestId, message: error?.message});
      try {
        await db.runTransaction(async (transaction) => {
          await assertContext(transaction);
          const snapshot = await transaction.get(executionRef);
          assertOwnership(snapshot);
          transaction.update(executionRef, {status: 'failed', finishedAtMs: clock()});
        });
      } catch (recordingError) {
        if (isStateError(recordingError)) throw recordingError;
        console.error('Could not record search failure:', {requestId});
      }
      fail('SEARCH_EXECUTION_FAILED',
          'Search could not be completed. Retry using the same request ID.');
    }
    try {
      await db.runTransaction(async (transaction) => {
        await assertContext(transaction);
        const snapshot = await transaction.get(executionRef);
        assertOwnership(snapshot);
        transaction.update(executionRef, {status: 'succeeded', result, finishedAtMs: clock()});
      });
    } catch (error) {
      if (isStateError(error)) throw error;
      console.error('Could not persist completed search:', {requestId});
      fail('SEARCH_RESULT_UNCONFIRMED',
          'The search result could not be confirmed. Use Retry with the same request ID.');
    }
    return {...result, ...responseMetadata, cached: false, recovered: claim.recovered};
  };
  return {runSearch};
};
module.exports = {EXECUTION_WARNING_AFTER_MS, EXECUTION_RECOVERY_AFTER_MS,
  MAX_UNCERTAIN_RECOVERIES, MAX_CACHED_RESULT_BYTES,
  executionFingerprint, createSearchExecutionService};
