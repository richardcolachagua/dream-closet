const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const admin = require("../../functions/node_modules/firebase-admin");

const {
  createSearchQuotaService,
} = require("../../functions/search/quota/searchQuotaService");

const PROJECT_ID = "demo-dream-closet-quota";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("Firestore emulator required. Run test:search-quota:local.");
}

const app = admin.initializeApp(
  { projectId: PROJECT_ID },
  `quota-tests-${randomUUID()}`,
);

const db = app.firestore();

test.after(async () => {
  await app.delete();
});

const authFor = (uid, anonymous = false) => ({
  uid,
  token: {
    firebase: {
      sign_in_provider: anonymous ? "anonymous" : "password",
    },
  },
});

const createFixture = async ({ visitor = false, subscription = null } = {}) => {
  const uid = randomUUID();
  let nowMs = Date.parse("2026-11-19T18:00:00.000Z");

  if (!visitor) {
    await db
      .collection("users")
      .doc(uid)
      .set({
        firstName: "Quota",
        lastName: "Test",
        ...(subscription ? { subscription } : {}),
      });
  }

  const service = createSearchQuotaService({
    db,
    clock: () => nowMs,
    getProPriceId: () => "price_test_pro",
  });

  return {
    uid,
    auth: authFor(uid, visitor),
    service,
    advance: (duration) => {
      nowMs += duration;
    },
  };
};

const search = (fixture, overrides = {}) =>
  fixture.service.reserveSearch({
    auth: fixture.auth,
    requestId: randomUUID(),
    query: "black linen shirt",
    action: "new",
    ...overrides,
  });

test("simultaneous visitor searches cannot exceed three reservations", async () => {
  const fixture = await createFixture({ visitor: true });

  await search(fixture);
  await search(fixture);

  const results = await Promise.allSettled([search(fixture), search(fixture)]);

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );

  const rejected = results.find((result) => result.status === "rejected");

  assert.equal(rejected.reason.code, "resource-exhausted");
  assert.equal(rejected.reason.details.reason, "SEARCH_QUOTA_EXHAUSTED");

  const { quota } = await fixture.service.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(quota.used, 3);
  assert.equal(quota.remaining, 0);
});

test("simultaneous submissions with one ID charge quota once", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  const results = await Promise.all([
    search(fixture, { requestId }),
    search(fixture, { requestId }),
  ]);

  assert.equal(results.filter((result) => result.reused === false).length, 1);

  assert.equal(results.filter((result) => result.reused === true).length, 1);

  const { quota } = await fixture.service.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(quota.used, 1);
});

test("retries and refinements reuse an exhausted allowance", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await search(fixture, { requestId });

  for (let index = 0; index < 4; index += 1) {
    await search(fixture);
  }

  const retry = await search(fixture, {
    requestId,
    action: "retry",
  });

  const refine = await search(fixture, {
    requestId,
    action: "refine",
  });

  assert.equal(retry.reused, true);
  assert.equal(refine.reused, true);
  assert.equal(refine.quota.used, 5);
  assert.equal(refine.quota.remaining, 0);
});

test("request ID cannot be reused with different query text", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await search(fixture, { requestId });

  await assert.rejects(
    search(fixture, {
      requestId,
      query: "red leather boots",
    }),
    (error) =>
      error.code === "invalid-argument" &&
      error.details.reason === "REQUEST_ID_QUERY_MISMATCH",
  );
});

test("query case and whitespace do not create an ID mismatch", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await search(fixture, {
    requestId,
    query: "  Black   Linen Shirt ",
  });

  const result = await search(fixture, {
    requestId,
    query: "black linen shirt",
    action: "retry",
  });

  assert.equal(result.reused, true);
  assert.equal(result.quota.used, 1);
});

test("a refinement cannot create a missing reservation", async () => {
  const fixture = await createFixture();

  await assert.rejects(
    search(fixture, { action: "refine" }),
    (error) =>
      error.code === "failed-precondition" &&
      error.details.reason === "SEARCH_RESERVATION_REQUIRED",
  );
});

test("one user's request ID does not authorize another user's retry", async () => {
  const first = await createFixture();
  const second = await createFixture();
  const requestId = randomUUID();

  await search(first, { requestId });

  await assert.rejects(
    search(second, {
      requestId,
      action: "retry",
    }),
    (error) => error.details.reason === "SEARCH_RESERVATION_REQUIRED",
  );
});

test("anonymous-to-registered transition keeps separate counters with the same UID", async () => {
  const fixture = await createFixture({ visitor: true });

  for (let index = 0; index < 3; index += 1) {
    await search(fixture);
  }

  await db.collection("users").doc(fixture.uid).set({
    firstName: "Registered",
    lastName: "Test",
  });

  const registeredAuth = authFor(fixture.uid);

  const registered = await fixture.service.reserveSearch({
    auth: registeredAuth,
    requestId: randomUUID(),
    query: "blue cotton shirt",
    action: "new",
  });

  const visitor = await fixture.service.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(registered.quota.tier, "free");
  assert.equal(registered.quota.remaining, 4);
  assert.equal(visitor.quota.remaining, 0);
});

test("trusted active configured-price subscription receives Pro", async () => {
  const fixture = await createFixture({
    subscription: {
      status: "active",
      priceId: "price_test_pro",
      stripeSubscriptionId: "sub_test",
    },
  });

  for (let index = 0; index < 6; index += 1) {
    const result = await search(fixture);

    assert.equal(result.quota.tier, "pro");
    assert.equal(result.quota.unlimited, true);
  }
});

test("unknown subscription price and client tier claims do not grant Pro", async () => {
  const fixture = await createFixture({
    subscription: {
      status: "active",
      priceId: "price_some_other_product",
      stripeSubscriptionId: "sub_test",
    },
  });

  fixture.auth.token.tier = "pro";
  fixture.auth.token.admin = true;

  const result = await search(fixture);

  assert.equal(result.quota.tier, "free");
  assert.equal(result.quota.remaining, 4);
});

test("Pro requests still encounter the separate abuse limit", async () => {
  const fixture = await createFixture({
    subscription: {
      status: "active",
      priceId: "price_test_pro",
      stripeSubscriptionId: "sub_test",
    },
  });

  for (let index = 0; index < 30; index += 1) {
    await search(fixture);
  }

  await assert.rejects(
    search(fixture),
    (error) =>
      error.code === "resource-exhausted" &&
      error.details.reason === "SEARCH_RATE_LIMIT",
  );

  fixture.advance(60000);

  const result = await search(fixture);

  assert.equal(result.quota.tier, "pro");
});

test("expired reservation cannot be reused for free searches", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await search(fixture, { requestId });

  fixture.advance(24 * 60 * 60 * 1000);

  await assert.rejects(
    search(fixture, {
      requestId,
      action: "retry",
    }),
    (error) => error.details.reason === "SEARCH_RESERVATION_EXPIRED",
  );
});

test("deleting accounts cannot reserve searches", async () => {
  const fixture = await createFixture();

  await db.collection("accountDeletions").doc(fixture.uid).set({
    status: "pending",
  });

  await assert.rejects(
    search(fixture),
    (error) => error.details.reason === "ACCOUNT_DELETION_IN_PROGRESS",
  );
});

test("missing auth and missing registered profiles are rejected", async () => {
  const fixture = await createFixture();

  await assert.rejects(
    search(fixture, { auth: null }),
    (error) => error.code === "unauthenticated",
  );

  await assert.rejects(
    search(fixture, { auth: authFor(randomUUID()) }),
    (error) => error.details.reason === "PROFILE_REQUIRED",
  );
});

test("visitor quota becomes available after its reservation expires", async () => {
  const fixture = await createFixture({ visitor: true });

  await search(fixture);

  fixture.advance(60 * 60 * 1000);

  await search(fixture);
  await search(fixture);

  fixture.advance(23 * 60 * 60 * 1000);

  const { quota } = await fixture.service.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(quota.remaining, 1);

  const result = await search(fixture);

  assert.equal(result.quota.remaining, 0);
});

test("Free allowance renews at the New York calendar boundary", async () => {
  const fixture = await createFixture();

  for (let index = 0; index < 5; index += 1) {
    await search(fixture);
  }

  fixture.advance(11 * 60 * 60 * 1000);

  const { quota } = await fixture.service.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(quota.remaining, 5);
});
