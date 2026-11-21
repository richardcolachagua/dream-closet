const {createHash, randomUUID} = require('node:crypto');
const {HttpsError} = require('firebase-functions/v1/https');
const {identityFromAuth} = require('../quota/searchQuotaService');

const EXECUTION_WARNING_AFTER_MS = 90 * 1000;
const MAX_CACHED_RESULT_BYTES = 700000;

const hash = (value) => createHash('sha256').update(value).digest('hex');

const canonicalize = (value) => {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
        Object.keys(value)
            .sort()
            .map((key) => [key, canonicalize(value[key])]),
    );
  }

  throw new HttpsError(
      'invalid-argument',
      'Search parameters must contain valid JSON values.',
  );
};

const executionFingerprint = (payload) =>
  hash(JSON.stringify(canonicalize(payload)));

const createSearchExecutionService = ({
  db,
  quotaService,
  performSearch,
  clock = Date.now,
}) => {
  if (
    !db ||
    typeof db.runTransaction !== 'function' ||
    !quotaService ||
    typeof quotaService.reserveSearch !== 'function' ||
    typeof performSearch !== 'function'
  ) {
    throw new TypeError(
        'Firestore, quota service, and search provider function are required.',
    );
  }

  const runSearch = async ({auth, requestId, action = 'new', payload}) => {
    const identity = identityFromAuth(auth);

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new HttpsError(
          'invalid-argument',
          'Search parameters are required.',
      );
    }

    const normalizedPayload = canonicalize(payload);
    const fingerprint = executionFingerprint(normalizedPayload);

    const reservation = await quotaService.reserveSearch({
      auth,
      requestId,
      action,
      query: normalizedPayload.query,
    });

    const executionRef = db
        .collection('searchUsage')
        .doc(identity.key)
        .collection('reservations')
        .doc(hash(requestId))
        .collection('executions')
        .doc(fingerprint);

    const attemptId = randomUUID();

    const claim = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(executionRef);

      if (snapshot.exists) {
        const execution = snapshot.data();

        if (execution.version !== 1 || execution.fingerprint !== fingerprint) {
          throw new HttpsError('internal', 'Invalid stored search execution.');
        }

        if (execution.status === 'succeeded') {
          return {
            cached: true,
            result: execution.result,
          };
        }

        if (execution.status === 'running') {
          const stale =
            clock() - execution.startedAtMs >= EXECUTION_WARNING_AFTER_MS;

          throw new HttpsError(
              'unavailable',
            stale ?
              'The previous search outcome is uncertain.' :
              'This search is already running.',
            {
              reason: stale ?
                'SEARCH_EXECUTION_UNCERTAIN' :
                'SEARCH_IN_PROGRESS',
              requestId,
              retryAfterMs: stale ? null : 1000,
            },
          );
        }

        if (execution.status !== 'failed') {
          throw new HttpsError(
              'internal',
              'Unknown stored search execution status.',
          );
        }

        if (action !== 'retry') {
          throw new HttpsError(
              'unavailable',
              'The previous search attempt failed. Retry this search.',
              {
                reason: 'SEARCH_RETRY_REQUIRED',
                requestId,
              },
          );
        }
      }

      transaction.set(executionRef, {
        version: 1,
        fingerprint,
        status: 'running',
        attemptId,
        startedAtMs: clock(),
        reservationExpiresAt: reservation.reservationExpiresAt,
      });

      return {cached: false};
    });

    const responseMetadata = {
      requestId,
      reservationExpiresAt: reservation.reservationExpiresAt,
      quota: reservation.quota,
      reservationReused: reservation.reused,
    };

    if (claim.cached) {
      return {
        ...claim.result,
        ...responseMetadata,
        cached: true,
      };
    }

    let result;

    try {
      const providerResult = await performSearch(normalizedPayload);

      if (
        !providerResult ||
        typeof providerResult !== 'object' ||
        Array.isArray(providerResult) ||
        !Array.isArray(providerResult.results)
      ) {
        throw new Error('Search returned an invalid response.');
      }

      result = canonicalize(providerResult);

      const byteLength = Buffer.byteLength(JSON.stringify(result), 'utf8');

      if (byteLength > MAX_CACHED_RESULT_BYTES) {
        throw new Error('Search response exceeds the cache size limit.');
      }
    } catch (error) {
      console.error('Search execution failed:', {
        requestId,
        message: error?.message,
      });

      try {
        await db.runTransaction(async (transaction) => {
          const snapshot = await transaction.get(executionRef);
          const current = snapshot.data();

          if (
            snapshot.exists &&
            current.status === 'running' &&
            current.attemptId === attemptId
          ) {
            transaction.update(executionRef, {
              status: 'failed',
              finishedAtMs: clock(),
            });
          }
        });
      } catch (recordingError) {
        console.error('Could not record search failure:', {
          requestId,
          message: recordingError?.message,
        });
      }

      throw new HttpsError(
          'unavailable',
          'Search could not be completed. Retry using the same request ID.',
          {
            reason: 'SEARCH_EXECUTION_FAILED',
            ...responseMetadata,
          },
      );
    }

    try {
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(executionRef);
        const current = snapshot.data();

        if (
          !snapshot.exists ||
          current.status !== 'running' ||
          current.attemptId !== attemptId
        ) {
          throw new Error('Search execution ownership changed.');
        }

        transaction.update(executionRef, {
          status: 'succeeded',
          result,
          finishedAtMs: clock(),
        });
      });
    } catch (error) {
      console.error('Could not persist completed search:', {
        requestId,
        message: error?.message,
      });

      throw new HttpsError(
          'unavailable',
          'The search completed, but its result could not be confirmed.',
          {
            reason: 'SEARCH_RESULT_UNCONFIRMED',
            ...responseMetadata,
          },
      );
    }

    return {
      ...result,
      ...responseMetadata,
      cached: false,
    };
  };

  return {runSearch};
};

module.exports = {
  EXECUTION_WARNING_AFTER_MS,
  MAX_CACHED_RESULT_BYTES,
  executionFingerprint,
  createSearchExecutionService,
};
