const {createHash} = require('node:crypto');

const EXPIRY_GRACE_MS = 10 * 60 * 1000;
const MAX_RESERVATIONS_PER_RUN = 50;

const usageKey = (kind, uid) => createHash('sha256')
    .update(JSON.stringify([kind, uid])).digest('hex');

const createSearchDataLifecycle = ({db, clock = Date.now}) => {
  if (!db || typeof db.recursiveDelete !== 'function') {
    throw new TypeError('Firestore recursiveDelete is required.');
  }

  const deleteForUid = async (uid) => {
    if (typeof uid !== 'string' || !uid || uid.includes('/')) {
      throw new TypeError('A valid UID is required.');
    }
    const marker = await db.collection('accountDeletions').doc(uid).get();
    if (!marker.exists) {
      throw new Error('Account deletion must be locked before search cleanup.');
    }
    for (const kind of ['visitor', 'registered']) {
      await db.recursiveDelete(db.collection('searchUsage')
          .doc(usageKey(kind, uid)));
    }
  };

  const sweepExpired = async () => {
    const cutoff = clock() - EXPIRY_GRACE_MS;
    const candidates = await db.collectionGroup('reservations')
        .where('expiresAtMs', '<=', cutoff)
        .orderBy('expiresAtMs')
        .limit(MAX_RESERVATIONS_PER_RUN).get();
    let deleted = 0;
    let skipped = 0;
    for (const snapshot of candidates.docs) {
      if (!/^searchUsage\/[^/]+\/reservations\/[^/]+$/.test(snapshot.ref.path)) {
        skipped += 1;
        continue;
      }
      const value = snapshot.data();
      if (value.version !== 1 || !Number.isSafeInteger(value.expiresAtMs) ||
          value.expiresAtMs > cutoff) {
        skipped += 1;
        continue;
      }
      // Expiry is immutable. Execution claims recheck it transactionally.
      await db.recursiveDelete(snapshot.ref);
      deleted += 1;
    }
    return {scanned: candidates.size, deleted, skipped,
      limitReached: candidates.size === MAX_RESERVATIONS_PER_RUN};
  };

  return {deleteForUid, sweepExpired};
};

module.exports = {
  EXPIRY_GRACE_MS,
  MAX_RESERVATIONS_PER_RUN,
  usageKey,
  createSearchDataLifecycle,
};
