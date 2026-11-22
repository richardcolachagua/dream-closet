const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID, createHash} = require('node:crypto');
const admin = require('../../functions/node_modules/firebase-admin');
const {createSearchDataLifecycle, usageKey, EXPIRY_GRACE_MS,
  MAX_RESERVATIONS_PER_RUN} = require('../../functions/search/services/searchDataLifecycle');
const {createSearchQuotaService} = require('../../functions/search/quota/searchQuotaService');
const {createSearchExecutionService} = require('../../functions/search/services/searchExecutionService');
if (!process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.GCLOUD_PROJECT !== 'demo-dream-closet-lifecycle') {
  throw new Error('Run with the documented dedicated demo lifecycle emulator command.');
}
const app = admin.initializeApp({projectId: 'demo-dream-closet-lifecycle'}, randomUUID());
const db = app.firestore();
const now = Date.parse('2026-11-22T18:00:00Z');
const service = () => createSearchDataLifecycle({db, clock: () => now});
const refFor = (uid, kind = 'registered') => db.collection('searchUsage').doc(usageKey(kind, uid));
const hash = (value) => createHash('sha256').update(value).digest('hex');
const authFor = (uid) => ({uid, token: {firebase: {sign_in_provider: 'password'}}});
test.beforeEach(async () => {
  await db.recursiveDelete(db.collection('searchUsage'));
  await db.recursiveDelete(db.collection('unrelated'));
  await db.recursiveDelete(db.collection('accountDeletions'));
});
test.after(async () => app.delete());
async function seed(uid, expiresAtMs, kind = 'registered') {
  const usage = refFor(uid, kind);
  await usage.set({version: 1, visitorReservations: [], rateRequests: [],
    freeUsed: 4, freeDayKey: '2026-11-22'});
  const reservation = usage.collection('reservations').doc(randomUUID());
  await reservation.set({version: 1, expiresAtMs});
  await reservation.collection('executions').doc('cached').set({result: {results: []}});
  return {usage, reservation};
}
test('expired reservation and nested cache are removed but counters remain', async () => {
  const {usage, reservation} = await seed(randomUUID(), now - EXPIRY_GRACE_MS);
  assert.equal((await service().sweepExpired()).deleted, 1);
  assert.equal((await reservation.get()).exists, false);
  assert.equal((await reservation.collection('executions').get()).size, 0);
  assert.equal((await usage.get()).data().freeUsed, 4);
});
test('active reservations and grace-period caches remain', async () => {
  const a = await seed(randomUUID(), now + 1000);
  const b = await seed(randomUUID(), now - EXPIRY_GRACE_MS + 1);
  assert.equal((await service().sweepExpired()).deleted, 0);
  assert.equal((await a.reservation.get()).exists, true);
  assert.equal((await b.reservation.get()).exists, true);
});
test('cleanup is safe to rerun', async () => {
  await seed(randomUUID(), now - EXPIRY_GRACE_MS - 1);
  await service().sweepExpired();
  assert.equal((await service().sweepExpired()).deleted, 0);
});
test('account cleanup requires a deletion marker', async () => {
  const uid = randomUUID();
  await seed(uid, now + 1000);
  await assert.rejects(service().deleteForUid(uid), /locked/);
  assert.equal((await refFor(uid).get()).exists, true);
});
test('locked account removes both identity trees and preserves other accounts', async () => {
  const uid = randomUUID();
  const other = randomUUID();
  const a = await seed(uid, now + 1000, 'visitor');
  const b = await seed(uid, now + 1000);
  await seed(other, now + 1000);
  await db.collection('accountDeletions').doc(uid).set({status: 'in_progress'});
  await service().deleteForUid(uid);
  await service().deleteForUid(uid);
  assert.equal((await a.usage.get()).exists, false);
  assert.equal((await b.usage.get()).exists, false);
  assert.equal((await a.reservation.collection('executions').get()).size, 0);
  assert.equal((await refFor(other).get()).exists, true);
});
test('sweep checks path before deleting unrelated reservations', async () => {
  const r = db.collection('unrelated').doc('x').collection('reservations').doc('x');
  await r.set({version: 1, expiresAtMs: 1});
  const result = await service().sweepExpired();
  assert.equal(result.skipped, 1);
  assert.equal((await r.get()).exists, true);
});
test('each sweep bounds the number of reservation roots', async () => {
  const root = refFor(randomUUID());
  const batch = db.batch();
  for (let i = 0; i < MAX_RESERVATIONS_PER_RUN + 1; i += 1) {
    batch.set(root.collection('reservations').doc(String(i)), {version: 1, expiresAtMs: i});
  }
  await batch.commit();
  const result = await service().sweepExpired();
  assert.equal(result.deleted, MAX_RESERVATIONS_PER_RUN);
  assert.equal(result.limitReached, true);
  assert.equal((await root.collection('reservations').get()).size, 1);
});
async function raceFixture(afterReserve) {
  const uid = randomUUID();
  const auth = authFor(uid);
  await db.collection('users').doc(uid).set({});
  const quota = createSearchQuotaService({db, clock: () => now});
  let calls = 0;
  const execution = createSearchExecutionService({db, clock: () => now,
    quotaService: {reserveSearch: async (args) => {
      const result = await quota.reserveSearch(args);
      await afterReserve({uid, args});
      return result;
    }},
    performSearch: async () => {calls += 1; return {results: []};},
  });
  return {uid, calls: () => calls,
    run: () => execution.runSearch({auth, requestId: randomUUID(), payload: {query: 'linen'}})};
}
test('deletion between reservation and execution claim blocks provider work', async () => {
  const f = await raceFixture(async ({uid}) => {
    await db.collection('accountDeletions').doc(uid).set({status: 'in_progress'});
    await service().deleteForUid(uid);
  });
  await assert.rejects(f.run(), (e) => e.details.reason === 'ACCOUNT_DELETION_IN_PROGRESS');
  assert.equal(f.calls(), 0);
  assert.equal((await refFor(f.uid).get()).exists, false);
  assert.equal((await refFor(f.uid).collection('reservations').get()).size, 0);
});
test('missing reservation cannot create orphaned execution', async () => {
  const f = await raceFixture(async ({uid, args}) => {
    await db.recursiveDelete(refFor(uid).collection('reservations').doc(hash(args.requestId)));
  });
  await assert.rejects(f.run(), (e) => e.details.reason === 'SEARCH_RESERVATION_EXPIRED');
  assert.equal(f.calls(), 0);
});
test('existing reservation expired after reserve cannot start provider work', async () => {
  const f = await raceFixture(async ({uid, args}) => {
    await refFor(uid).collection('reservations').doc(hash(args.requestId)).update({expiresAtMs: now});
  });
  await assert.rejects(f.run(), (e) => e.details.reason === 'SEARCH_RESERVATION_EXPIRED');
  assert.equal(f.calls(), 0);
});
