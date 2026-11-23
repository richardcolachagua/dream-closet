const {randomUUID} = require('node:crypto');
const {FieldPath} = require('firebase-admin/firestore');
const {usageKey, createSearchDataLifecycle, EXPIRY_GRACE_MS} = require('./searchDataLifecycle');

const PAGE_SIZE = 50;
const INACTIVE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const LEASE_MS = 15 * 60 * 1000;

const createSearchMaintenance = ({db, clock = Date.now}) => {
  const stateRef = db.collection('searchMaintenance').doc('release-v1');
  const lifecycle = createSearchDataLifecycle({db, clock});
  const run = async ({dryRun = false} = {}) => {
    const token = randomUUID();
    const state = await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(stateRef);
      const stored = snapshot.data() || {};
      if (stored.leaseUntilMs > clock()) return null;
      if (!dryRun) {
        tx.set(stateRef, {leaseOwner: token,
          leaseUntilMs: clock() + LEASE_MS}, {merge: true});
      }
      return stored;
    });
    if (!state) return {busy: true};
    const summary = {busy: false, dryRun, expired: 0, inactive: 0,
      backfilled: 0, skipped: 0, failed: 0};
    const next = {};
    try {
      let query = db.collectionGroup('reservations')
          .where('expiresAtMs', '<=', clock() - EXPIRY_GRACE_MS)
          .orderBy('expiresAtMs').orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
      if (state.expiryCursor) {
        query = query.startAfter(state.expiryCursor.time, db.doc(state.expiryCursor.path));
      }
      const expired = await query.get();
      for (const snap of expired.docs) {
        const value = snap.data();
        if (!/^searchUsage\/[^/]+\/reservations\/[^/]+$/.test(snap.ref.path) ||
            value.version !== 1 || !Number.isSafeInteger(value.expiresAtMs)) {
          summary.skipped += 1; continue;
        }
        try {
          if (!dryRun) await db.recursiveDelete(snap.ref);
          summary.expired += 1;
        } catch (error) {
          summary.failed += 1;
        }
      }
      const last = expired.docs[expired.docs.length - 1];
      next.expiryCursor = expired.size === PAGE_SIZE ?
        {time: last.data().expiresAtMs, path: last.ref.path} : null;

      let rootsQuery = db.collection('searchUsage').orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
      if (state.usageCursor) rootsQuery = rootsQuery.startAfter(state.usageCursor);
      const roots = await rootsQuery.get();
      for (const snap of roots.docs) {
        try {
          const removed = await db.runTransaction(async (tx) => {
            const current = await tx.get(snap.ref);
            const v = current.data();
            const cutoff = clock() - INACTIVE_RETENTION_MS;
            if (!v || v.version !== 1 || !Number.isSafeInteger(v.lastActivityAtMs) ||
                v.lastActivityAtMs > cutoff ||
                !['visitor', 'registered'].includes(v.kind) || typeof v.uid !== 'string' ||
                snap.id !== usageKey(v.kind, v.uid) ||
                !Array.isArray(v.rateRequests) || !Array.isArray(v.visitorReservations) ||
                [...v.rateRequests, ...v.visitorReservations].some((t) =>
                  !Number.isSafeInteger(t) || t > cutoff) ||
                (v.freeDayKey !== null && (typeof v.freeDayKey !== 'string' ||
                  !/^\d{4}-\d{2}-\d{2}$/.test(v.freeDayKey) ||
                  v.freeDayKey >= new Date(cutoff).toISOString().slice(0, 10)))) return false;
            const children = await tx.get(snap.ref.collection('reservations').limit(1));
            if (!children.empty) return false;
            // Only delete the root. Never recursively delete an inactive live account.
            if (!dryRun) tx.delete(snap.ref);
            return true;
          });
          if (removed) summary.inactive += 1;
        } catch (error) {
          summary.failed += 1;
        }
      }
      next.usageCursor = roots.size === PAGE_SIZE ? roots.docs[roots.size - 1].id : null;

      let markersQuery = db.collection('accountDeletions')
          .orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
      if (state.deletionCursor) markersQuery = markersQuery.startAfter(state.deletionCursor);
      const markers = await markersQuery.get();
      for (const snap of markers.docs) {
        if (snap.data().status !== 'complete' || snap.data().searchCleanupVersion === 1) continue;
        try {
          if (!dryRun) {
            await lifecycle.deleteForUid(snap.id);
            await snap.ref.update({searchCleanupVersion: 1, searchCleanupAtMs: clock()});
          }
          summary.backfilled += 1;
        } catch (error) {
          summary.failed += 1;
        }
      }
      next.deletionCursor = markers.size === PAGE_SIZE ? markers.docs[markers.size - 1].id : null;
      if (!dryRun) {
        await db.runTransaction(async (tx) => {
          const current = await tx.get(stateRef);
          if (current.data()?.leaseOwner !== token) throw new Error('Maintenance lease changed.');
          tx.set(stateRef, {...next, lastRunAtMs: clock(), lastSummary: summary,
            leaseOwner: null, leaseUntilMs: 0}, {merge: true});
        });
      }
      return summary;
    } catch (error) {
      // Leave the lease to expire; a later run repeats uncheckpointed work.
      console.error('Search maintenance failed:', {message: error?.message});
      throw error;
    }
  };
  return {run};
};
module.exports = {createSearchMaintenance, PAGE_SIZE, INACTIVE_RETENTION_MS, LEASE_MS};
