const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID, createHash} = require('node:crypto');
if (!process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.GCLOUD_PROJECT !== 'demo-dream-closet-recovery') {
  throw new Error('Run using the dedicated demo recovery emulator command.');
}
const admin = require('../../functions/node_modules/firebase-admin');
const {createSearchQuotaService, identityFromAuth} =
  require('../../functions/search/quota/searchQuotaService');
const {createSearchExecutionService, executionFingerprint,
  EXECUTION_RECOVERY_AFTER_MS, MAX_UNCERTAIN_RECOVERIES} =
  require('../../functions/search/services/searchExecutionService');
const {createSearchDataLifecycle} = require('../../functions/search/services/searchDataLifecycle');
const {createDeleteAccountHandler} = require('../../functions/pricing/services/deleteAccount');
const app = admin.initializeApp({projectId: 'demo-dream-closet-recovery'}, randomUUID());
const db = app.firestore();
test.after(async () => {
  await app.delete();
  const defaultApp = admin.apps.find((a) => a && a.name === '[DEFAULT]');
  if (defaultApp) await defaultApp.delete();
});
const hash = (s) => createHash('sha256').update(s).digest('hex');
const deferred = () => {
  let resolve;
  const promise = new Promise((finish) => {resolve = finish;});
  return {promise, resolve};
};
const payload = {query: 'black linen shirt', page: 1};
const product = (id) => ({results: [{id}]});
async function fixture(provider = async () => product('ok'), dataDb = db) {
  const uid = randomUUID();
  const auth = {uid, token: {auth_time: Math.floor(Date.now() / 1000),
    firebase: {sign_in_provider: 'password'}}};
  await db.collection('users').doc(uid).set({firstName: 'Recovery'});
  let now = Date.now();
  let calls = 0;
  const quota = createSearchQuotaService({db, clock: () => now});
  const execution = createSearchExecutionService({db: dataDb, quotaService: quota,
    clock: () => now, performSearch: async () => {calls += 1; return provider(calls);}});
  const requestId = randomUUID();
  const root = db.collection('searchUsage').doc(identityFromAuth(auth).key);
  const reservationRef = root.collection('reservations').doc(hash(requestId));
  const executionRef = reservationRef.collection('executions').doc(executionFingerprint(payload));
  return {uid, auth, quota, requestId, root, reservationRef, executionRef,
    calls: () => calls, now: () => now, advance: (ms) => {now += ms;},
    run: (action = 'retry') => execution.runSearch({auth, requestId, action, payload}),
    seed: async (recoveryCount) => {
      await quota.reserveSearch({auth, requestId, action: 'new', query: payload.query});
      await executionRef.set({version: 1, fingerprint: executionFingerprint(payload),
        status: 'running', attemptId: 'old', startedAtMs: now,
        ...(recoveryCount === undefined ? {} : {recoveryCount})});
    }};
}
const reason = (expected) => (e) => e.details?.reason === expected;

test('90-second uncertainty does not permit recovery yet', async () => {
  const f = await fixture(); await f.seed(); f.advance(90000);
  await assert.rejects(f.run(), (e) => e.details.reason === 'SEARCH_EXECUTION_UNCERTAIN' &&
    e.details.retryAfterMs === 90000);
  assert.equal(f.calls(), 0);
});
test('stale legacy execution requires explicit retry and reuses quota', async () => {
  const f = await fixture(); await f.seed(); f.advance(EXECUTION_RECOVERY_AFTER_MS);
  await assert.rejects(f.run('new'), reason('SEARCH_RETRY_REQUIRED'));
  const r = await f.run();
  assert.equal(r.recovered, true); assert.equal(r.reservationReused, true);
  assert.equal(r.quota.used, 1); assert.equal(f.calls(), 1);
  assert.equal((await f.executionRef.get()).data().recoveryCount, 1);
});
test('concurrent recovery claims start only one replacement', async () => {
  const entered = deferred(); const release = deferred();
  const f = await fixture(async () => {entered.resolve(); await release.promise; return product('new');});
  await f.seed(); f.advance(EXECUTION_RECOVERY_AFTER_MS);
  const pending = f.run();
  try {
    await entered.promise;
    await assert.rejects(f.run(), reason('SEARCH_IN_PROGRESS'));
    assert.equal(f.calls(), 1);
  } finally {release.resolve(); await pending;}
});
for (const lateFailure of [false, true]) {
  test(`late ${lateFailure ? 'failure' : 'success'} cannot overwrite replacement`, async () => {
    const entered = deferred(); const release = deferred();
    const f = await fixture(async (call) => {
      if (call === 1) {
        entered.resolve(); await release.promise;
        if (lateFailure) throw new Error('Late failure');
        return product('old');
      }
      return product('replacement');
    });
    const old = f.run('new').then((value) => ({value}), (error) => ({error}));
    try {
      await entered.promise; f.advance(EXECUTION_RECOVERY_AFTER_MS);
      assert.equal((await f.run()).results[0].id, 'replacement');
    } finally {release.resolve();}
    const oldOutcome = await old;
    assert.equal(oldOutcome.error.details.reason, 'SEARCH_EXECUTION_SUPERSEDED');
    const stored = (await f.executionRef.get()).data();
    assert.equal(stored.status, 'succeeded');
    assert.equal(stored.result.results[0].id, 'replacement');
    assert.equal((await f.run()).quota.used, 1);
  });
}
test('uncertain recovery is bounded', async () => {
  const f = await fixture(); await f.seed(MAX_UNCERTAIN_RECOVERIES);
  f.advance(EXECUTION_RECOVERY_AFTER_MS);
  await assert.rejects(f.run(), reason('SEARCH_RECOVERY_LIMIT'));
  assert.equal(f.calls(), 0);
});
function faultDb(mode) {
  let armed = true;
  return {collection: db.collection.bind(db), runTransaction: async (callback) => {
    let wroteSuccess = false;
    const result = await db.runTransaction(async (tx) => callback({
      get: tx.get.bind(tx), set: tx.set.bind(tx),
      update: (ref, value) => {
        if (value.status === 'succeeded') {
          wroteSuccess = true;
          if (armed && mode === 'before') {
            armed = false; throw new Error('Injected precommit failure');
          }
        }
        return tx.update(ref, value);
      },
    }));
    if (wroteSuccess && armed && mode === 'after') {
      armed = false; throw new Error('Injected lost commit acknowledgement');
    }
    return result;
  }};
}
test('lost success acknowledgement retrieves committed cache without another provider call', async () => {
  const f = await fixture(undefined, faultDb('after'));
  await assert.rejects(f.run('new'), reason('SEARCH_RESULT_UNCONFIRMED'));
  const r = await f.run();
  assert.equal(r.cached, true); assert.equal(f.calls(), 1); assert.equal(r.quota.used, 1);
});
test('uncommitted result waits for recovery then retries under same reservation', async () => {
  const f = await fixture(undefined, faultDb('before'));
  await assert.rejects(f.run('new'), reason('SEARCH_RESULT_UNCONFIRMED'));
  await assert.rejects(f.run(), reason('SEARCH_IN_PROGRESS'));
  f.advance(EXECUTION_RECOVERY_AFTER_MS);
  const r = await f.run();
  assert.equal(r.recovered, true); assert.equal(f.calls(), 2); assert.equal(r.quota.used, 1);
});
for (const lateFailure of [false, true]) {
  test(`deletion during provider ${lateFailure ? 'failure' : 'success'} does not recreate search data`, async () => {
    const entered = deferred(); const release = deferred();
    const f = await fixture(async () => {
      entered.resolve(); await release.promise;
      if (lateFailure) throw new Error('provider failed after deletion');
      return product('late');
    });
    const pending = f.run('new').then((value) => ({value}), (error) => ({error}));
    try {
      await entered.promise;
      await db.collection('accountDeletions').doc(f.uid).set({status: 'in_progress'});
      await createSearchDataLifecycle({db}).deleteForUid(f.uid);
    } finally {release.resolve();}
    assert.equal((await pending).error.details.reason, 'ACCOUNT_DELETION_IN_PROGRESS');
    assert.equal((await f.root.get()).exists, false);
    assert.equal((await f.executionRef.get()).exists, false);
  });
}
test('deletion marker blocks result caching even before recursive cleanup', async () => {
  const f = await fixture(async () => {
    await db.collection('accountDeletions').doc(f.uid).set({status: 'in_progress'});
    return product('discard');
  });
  await assert.rejects(f.run('new'), reason('ACCOUNT_DELETION_IN_PROGRESS'));
  assert.equal((await f.executionRef.get()).data().status, 'running');
});
test('expiry before completion prevents caching a late result', async () => {
  const f = await fixture(async () => {f.advance(24 * 60 * 60 * 1000); return product('late');});
  await assert.rejects(f.run('new'), reason('SEARCH_RESERVATION_EXPIRED'));
  assert.equal((await f.executionRef.get()).data().status, 'running');
});
test('actual deletion handler pauses on partial search deletion then resumes before Auth cleanup', async () => {
  const uid = randomUUID(); const events = [];
  const userRef = db.collection('users').doc(uid);
  await userRef.set({firstName: 'Delete'});
  const {usageKey} = require('../../functions/search/services/searchDataLifecycle');
  for (const kind of ['visitor', 'registered']) {
    const root = db.collection('searchUsage').doc(usageKey(kind, uid));
    await root.set({version: 1});
    await root.collection('reservations').doc('r').collection('executions').doc('e').set({result: 'cached'});
  }
  let fail = true;
  const wrappedDb = {
    collection: db.collection.bind(db), doc: db.doc.bind(db),
    runTransaction: db.runTransaction.bind(db),
    recursiveDelete: async (ref) => {
      events.push(ref.path.startsWith('searchUsage/') ? 'search' : 'profile');
      if (events.length === 2 && fail) {fail = false; throw new Error('Injected partial cleanup');}
      return db.recursiveDelete(ref);
    },
  };
  const handler = createDeleteAccountHandler({db: wrappedDb,
    admin: {auth: () => ({deleteUser: async () => {events.push('auth');}})},
    logger: {error() {}}, now: Date.now});
  const context = {auth: {uid, token: {auth_time: Math.floor(Date.now() / 1000),
    firebase: {sign_in_provider: 'password'}}}};
  const previous = process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_SECRET_KEY;
  try {
    await assert.rejects(handler({}, context), (e) => e.details.deletionPending === true);
    assert.equal((await userRef.get()).exists, true);
    assert.ok(!events.includes('auth'));
    assert.equal((await db.doc(`accountDeletions/${uid}`).get()).data().stage, 'search_cleanup');
    assert.deepEqual(await handler({resumePendingDeletion: true}, context), {success: true});
    assert.deepEqual(events, ['search', 'search', 'search', 'search', 'profile', 'auth']);
    for (const kind of ['visitor', 'registered']) {
      assert.equal((await db.doc(`searchUsage/${usageKey(kind, uid)}/reservations/r/executions/e`).get()).exists, false);
    }
    assert.equal((await db.doc(`accountDeletions/${uid}`).get()).data().status, 'complete');
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
  }
});
