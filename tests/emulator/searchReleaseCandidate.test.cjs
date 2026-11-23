const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
if (!process.env.FIRESTORE_EMULATOR_HOST || process.env.GCLOUD_PROJECT !== 'demo-dream-closet-release') {
  throw new Error('Use the documented isolated release emulator command.');
}
const admin = require('../../functions/node_modules/firebase-admin');
const {createSearchMaintenance, INACTIVE_RETENTION_MS, PAGE_SIZE} =
  require('../../functions/search/services/searchMaintenance');
const {usageKey} = require('../../functions/search/services/searchDataLifecycle');
const {createEntitlementRefresh} = require('../../functions/search/quota/entitlementRefresh');
const {createSearchQuotaService} = require('../../functions/search/quota/searchQuotaService');
const app = admin.initializeApp({projectId: 'demo-dream-closet-release'}, randomUUID());
const db = app.firestore();
const now = Date.parse('2026-11-22T18:00:00Z');
const run = (options) => createSearchMaintenance({db, clock: () => now}).run(options);
test.beforeEach(async () => {
  for (const name of ['searchUsage', 'searchMaintenance', 'accountDeletions', 'unrelated', 'users']) {
    await db.recursiveDelete(db.collection(name));
  }
});
test.after(async () => app.delete());
async function root(overrides = {}) {
  const uid = randomUUID(); const kind = 'registered';
  const ref = db.collection('searchUsage').doc(usageKey(kind, uid));
  await ref.set({version: 1, uid, kind, lastActivityAtMs: now - INACTIVE_RETENTION_MS,
    rateRequests: [], visitorReservations: [], freeDayKey: null, freeUsed: 0, ...overrides});
  return ref;
}
test('cursor advances beyond a full page of unrelated reservations', async () => {
  const batch = db.batch();
  for (let i = 0; i < PAGE_SIZE; i += 1) {
    batch.set(db.doc(`unrelated/x/reservations/${i}`), {version: 1, expiresAtMs: i});
  }
  const real = db.doc('searchUsage/u/reservations/r');
  batch.set(real, {version: 1, expiresAtMs: PAGE_SIZE + 1});
  await batch.commit();
  assert.equal((await run()).skipped, PAGE_SIZE);
  assert.equal((await real.get()).exists, true);
  assert.equal((await run()).expired, 1);
  assert.equal((await real.get()).exists, false);
});
test('old inactive verified usage root can be removed', async () => {
  const ref = await root();
  assert.equal((await run()).inactive, 1);
  assert.equal((await ref.get()).exists, false);
});
test('recent counter activity prevents usage removal', async () => {
  const ref = await root({rateRequests: [now]});
  assert.equal((await run()).inactive, 0);
  assert.equal((await ref.get()).exists, true);
});
test('usage with reservation children remains', async () => {
  const ref = await root();
  await ref.collection('reservations').doc('active').set({version: 1, expiresAtMs: now + 1000});
  assert.equal((await run()).inactive, 0);
  assert.equal((await ref.get()).exists, true);
});
test('legacy usage without last activity is retained', async () => {
  const ref = db.doc('searchUsage/legacy'); await ref.set({version: 1});
  assert.equal((await run()).inactive, 0);
  assert.equal((await ref.get()).exists, true);
});
test('dry run does not change data or progress state', async () => {
  const ref = await root();
  assert.equal((await run({dryRun: true})).inactive, 1);
  assert.equal((await ref.get()).exists, true);
  assert.equal((await db.doc('searchMaintenance/release-v1').get()).exists, false);
});
test('active scheduler lease prevents overlapping work', async () => {
  await db.doc('searchMaintenance/release-v1').set({leaseUntilMs: now + 1000});
  assert.equal((await run()).busy, true);
});
test('completed deletion backfill removes orphan descendants with missing usage parent', async () => {
  const uid = randomUUID();
  const ref = db.doc(`searchUsage/${usageKey('visitor', uid)}/reservations/r/executions/e`);
  await ref.set({cached: true});
  await db.doc(`accountDeletions/${uid}`).set({status: 'complete'});
  assert.equal((await run()).backfilled, 1);
  assert.equal((await ref.get()).exists, false);
  assert.equal((await db.doc(`accountDeletions/${uid}`).get()).data().searchCleanupVersion, 1);
});
async function entitlementFixture(provider) {
  const uid = randomUUID();
  await db.doc(`users/${uid}`).set({subscription: {status: 'active',
    stripeSubscriptionId: 'sub_example', priceId: 'price_pro'}});
  let calls = 0;
  const refresh = createEntitlementRefresh({db, clock: () => now, enabled: () => true,
    stripeFactory: () => ({subscriptions: {retrieve: async () => {calls += 1; return provider();}}})}).refresh;
  const quota = createSearchQuotaService({db, clock: () => now,
    refreshEntitlement: refresh, getProPriceId: () => 'price_pro'});
  const auth = {uid, token: {firebase: {sign_in_provider: 'password'}}};
  return {uid, auth, quota, calls: () => calls};
}
const subscription = (overrides = {}) => ({id: 'sub_example', status: 'active',
  items: {data: [{price: {id: 'price_pro'}, current_period_end: now / 1000 + 3600}]},
  ...overrides});
test('Stripe item-level period is verified and grants Pro', async () => {
  const f = await entitlementFixture(() => subscription());
  assert.equal((await f.quota.getSearchQuota({auth: f.auth})).quota.tier, 'pro');
  await f.quota.getSearchQuota({auth: f.auth});
  assert.equal(f.calls(), 1);
});
test('current cancellation replaces stale stored active entitlement', async () => {
  const f = await entitlementFixture(() => subscription({status: 'canceled'}));
  assert.equal((await f.quota.getSearchQuota({auth: f.auth})).quota.tier, 'free');
});
test('expired active period does not grant unlimited quota', async () => {
  const f = await entitlementFixture(() => subscription({current_period_end: now / 1000 - 1}));
  assert.equal((await f.quota.getSearchQuota({auth: f.auth})).quota.tier, 'free');
});
test('verification outage rejects before quota is reserved', async () => {
  const f = await entitlementFixture(() => {throw new Error('offline');});
  await assert.rejects(f.quota.reserveSearch({auth: f.auth, requestId: randomUUID(),
    query: 'linen', action: 'new'}), (e) => e.details.reason === 'SEARCH_ENTITLEMENT_UNAVAILABLE');
  const {identityFromAuth} = require('../../functions/search/quota/searchQuotaService');
  assert.equal((await db.doc(`searchUsage/${identityFromAuth(f.auth).key}`).get()).exists, false);
});
test('reservation writes retention metadata without changing quota charge', async () => {
  const uid = randomUUID();
  const auth = {uid, token: {firebase: {sign_in_provider: 'anonymous'}}};
  const quota = createSearchQuotaService({db, clock: () => now});
  await quota.reserveSearch({auth, requestId: randomUUID(), query: 'shirt'});
  const ref = db.doc(`searchUsage/${usageKey('visitor', uid)}`);
  assert.equal((await ref.get()).data().lastActivityAtMs, now);
  assert.equal((await quota.getSearchQuota({auth})).quota.used, 1);
});
