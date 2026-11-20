const {createHash} = require('node:crypto');
const {HttpsError} = require('firebase-functions/v1/https');
const {
  evaluateVisitorQuota,
  evaluateFreeQuota,
  evaluateProQuota,
} = require('./quotaPolicy');

const RESERVATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;

const hash = (value) => createHash('sha256').update(value).digest('hex');

const fail = (code, message, details = {}) => {
  throw new HttpsError(code, message, details);
};

const normalizeQuery = (query) => {
  if (typeof query !== 'string') {
    fail('invalid-argument', 'A text query is required.');
  }

  const normalized = query.normalize('NFKC').replace(/\s+/g, ' ').trim();

  if (!normalized || normalized.length > 250) {
    fail(
        'invalid-argument',
        'Query must contain between 1 and 250 characters.',
    );
  }

  return normalized.toLowerCase();
};

const identityFromAuth = (auth) => {
  const uid = auth?.uid;
  const provider = auth?.token?.firebase?.sign_in_provider;

  if (
    typeof uid !== 'string' ||
    !uid ||
    typeof provider !== 'string' ||
    !provider
  ) {
    fail('unauthenticated', 'A Firebase session is required.');
  }

  const kind = provider === 'anonymous' ? 'visitor' : 'registered';

  return {
    uid,
    kind,
    key: hash(JSON.stringify([kind, uid])),
  };
};

const resolveTier = ({identity, profile, proPriceId}) => {
  if (identity.kind === 'visitor') {
    return 'visitor';
  }

  const subscription = profile?.subscription;

  if (
    typeof proPriceId === 'string' &&
    proPriceId.length > 0 &&
    subscription?.status === 'active' &&
    subscription?.priceId === proPriceId &&
    typeof subscription?.stripeSubscriptionId === 'string' &&
    subscription.stripeSubscriptionId.startsWith('sub_')
  ) {
    return 'pro';
  }

  return 'free';
};

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('internal', `Invalid stored ${label}.`);
  }
};

const assertTimes = (values, nowMs, label) => {
  if (
    !Array.isArray(values) ||
    values.some(
        (value) => !Number.isSafeInteger(value) || value < 0 || value > nowMs,
    )
  ) {
    fail('internal', `Invalid stored ${label}.`);
  }
};

const readUsage = (snapshot, nowMs) => {
  if (!snapshot.exists) {
    return {
      visitorReservations: [],
      freeDayKey: null,
      freeUsed: 0,
      rateRequests: [],
    };
  }

  const value = snapshot.data();

  assertObject(value, 'search usage');

  if (value.version !== 1) {
    fail('internal', 'Unsupported search usage version.');
  }

  assertTimes(value.visitorReservations, nowMs, 'visitor usage');
  assertTimes(value.rateRequests, nowMs, 'request rate');

  if (
    !Number.isSafeInteger(value.freeUsed) ||
    value.freeUsed < 0 ||
    (value.freeDayKey !== null &&
      (typeof value.freeDayKey !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value.freeDayKey)))
  ) {
    fail('internal', 'Invalid stored Free usage.');
  }

  return {
    visitorReservations: value.visitorReservations,
    freeDayKey: value.freeDayKey,
    freeUsed: value.freeUsed,
    rateRequests: value.rateRequests,
  };
};

const evaluateUsage = (tier, usage, nowMs) => {
  if (tier === 'visitor') {
    return evaluateVisitorQuota({
      nowMs,
      reservations: usage.visitorReservations,
    }).quota;
  }

  if (tier === 'pro') {
    return evaluateProQuota();
  }

  return evaluateFreeQuota({
    nowMs,
    storedDayKey: usage.freeDayKey,
    storedUsed: usage.freeUsed,
  }).quota;
};

const validateReservation = ({snapshot, identity, queryHash, nowMs}) => {
  const reservation = snapshot.data();

  assertObject(reservation, 'search reservation');

  if (
    reservation.version !== 1 ||
    reservation.uid !== identity.uid ||
    reservation.kind !== identity.kind ||
    typeof reservation.queryHash !== 'string' ||
    !Number.isSafeInteger(reservation.reservedAtMs) ||
    !Number.isSafeInteger(reservation.expiresAtMs) ||
    reservation.reservedAtMs < 0 ||
    reservation.reservedAtMs > nowMs ||
    reservation.expiresAtMs !==
      reservation.reservedAtMs + RESERVATION_LIFETIME_MS
  ) {
    fail('internal', 'Invalid stored search reservation.');
  }

  if (reservation.queryHash !== queryHash) {
    fail(
        'invalid-argument',
        'This request ID belongs to a different text query.',
        {reason: 'REQUEST_ID_QUERY_MISMATCH'},
    );
  }

  if (reservation.expiresAtMs <= nowMs) {
    fail(
        'failed-precondition',
        'This search session has expired. Start a new search.',
        {reason: 'SEARCH_RESERVATION_EXPIRED'},
    );
  }

  return reservation;
};

const createSearchQuotaService = ({
  db,
  clock = Date.now,
  getProPriceId = () => process.env.STRIPE_PRICE_ID,
}) => {
  if (!db || typeof db.runTransaction !== 'function') {
    throw new TypeError('A Firestore instance is required.');
  }

  const readAccount = async (transaction, identity) => {
    const deletionRef = db.collection('accountDeletions').doc(identity.uid);

    const deletion = await transaction.get(deletionRef);

    if (deletion.exists) {
      fail('failed-precondition', 'Account deletion is in progress.', {
        reason: 'ACCOUNT_DELETION_IN_PROGRESS',
      });
    }

    if (identity.kind === 'visitor') {
      return null;
    }

    const profileRef = db.collection('users').doc(identity.uid);
    const profile = await transaction.get(profileRef);

    if (!profile.exists) {
      fail(
          'failed-precondition',
          'Complete profile initialization before searching.',
          {reason: 'PROFILE_REQUIRED'},
      );
    }

    return profile.data();
  };

  const reserveSearch = async ({auth, requestId, query, action = 'new'}) => {
    const identity = identityFromAuth(auth);

    if (
      typeof requestId !== 'string' ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(requestId)
    ) {
      fail('invalid-argument', 'A valid request ID is required.');
    }

    if (!['new', 'retry', 'refine'].includes(action)) {
      fail('invalid-argument', 'Invalid search action.');
    }

    const queryHash = hash(normalizeQuery(query));

    const usageRef = db.collection('searchUsage').doc(identity.key);

    const reservationRef = usageRef
        .collection('reservations')
        .doc(hash(requestId));

    return db.runTransaction(async (transaction) => {
      const nowMs = clock();
      const profile = await readAccount(transaction, identity);

      const usageSnapshot = await transaction.get(usageRef);
      const reservationSnapshot = await transaction.get(reservationRef);

      const usage = readUsage(usageSnapshot, nowMs);

      const tier = resolveTier({
        identity,
        profile,
        proPriceId: getProPriceId(),
      });

      let reservation = null;

      if (reservationSnapshot.exists) {
        reservation = validateReservation({
          snapshot: reservationSnapshot,
          identity,
          queryHash,
          nowMs,
        });
      } else if (action !== 'new') {
        fail(
            'failed-precondition',
            'Start a text search before retrying or refining it.',
            {reason: 'SEARCH_RESERVATION_REQUIRED'},
        );
      }

      const rateRequests = usage.rateRequests.filter(
          (value) => value + RATE_WINDOW_MS > nowMs,
      );

      if (rateRequests.length >= RATE_LIMIT) {
        fail(
            'resource-exhausted',
            'Too many search requests. Please wait before trying again.',
            {
              reason: 'SEARCH_RATE_LIMIT',
              retryAt: new Date(rateRequests[0] + RATE_WINDOW_MS).toISOString(),
            },
        );
      }

      if (!reservation) {
        const before = evaluateUsage(tier, usage, nowMs);

        if (!before.canSearch) {
          fail('resource-exhausted', 'Your search allowance is exhausted.', {
            reason: 'SEARCH_QUOTA_EXHAUSTED',
            quota: before,
          });
        }

        if (tier === 'visitor') {
          const visitor = evaluateVisitorQuota({
            nowMs,
            reservations: usage.visitorReservations,
          });

          usage.visitorReservations = [...visitor.activeReservations, nowMs];
        } else if (tier === 'free') {
          const free = evaluateFreeQuota({
            nowMs,
            storedDayKey: usage.freeDayKey,
            storedUsed: usage.freeUsed,
          });

          usage.freeDayKey = free.dayKey;
          usage.freeUsed = free.quota.used + 1;
        }

        reservation = {
          version: 1,
          uid: identity.uid,
          kind: identity.kind,
          queryHash,
          reservedAtMs: nowMs,
          expiresAtMs: nowMs + RESERVATION_LIFETIME_MS,
          tierAtReservation: tier,
        };

        transaction.create(reservationRef, reservation);
      }

      usage.rateRequests = [...rateRequests, nowMs];

      transaction.set(usageRef, {
        version: 1,
        ...usage,
      });

      return {
        requestId,
        reused: reservationSnapshot.exists,
        reservationExpiresAt: new Date(reservation.expiresAtMs).toISOString(),
        quota: evaluateUsage(tier, usage, nowMs),
      };
    });
  };

  const getSearchQuota = async ({auth}) => {
    const identity = identityFromAuth(auth);

    const usageRef = db.collection('searchUsage').doc(identity.key);

    return db.runTransaction(async (transaction) => {
      const nowMs = clock();
      const profile = await readAccount(transaction, identity);
      const usageSnapshot = await transaction.get(usageRef);
      const usage = readUsage(usageSnapshot, nowMs);

      const tier = resolveTier({
        identity,
        profile,
        proPriceId: getProPriceId(),
      });

      return {
        quota: evaluateUsage(tier, usage, nowMs),
      };
    });
  };

  return {
    reserveSearch,
    getSearchQuota,
  };
};

module.exports = {
  RESERVATION_LIFETIME_MS,
  RATE_WINDOW_MS,
  RATE_LIMIT,
  normalizeQuery,
  identityFromAuth,
  resolveTier,
  createSearchQuotaService,
};
