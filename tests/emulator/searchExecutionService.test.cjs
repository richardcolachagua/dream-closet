const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");

const admin = require("../../functions/node_modules/firebase-admin");

const {
  createSearchQuotaService,
} = require("../../functions/search/quota/searchQuotaService");

const {
  EXECUTION_WARNING_AFTER_MS,
  createSearchExecutionService,
} = require("../../functions/search/services/searchExecutionService");

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    "Firestore emulator required. Run test:search-execution:local.",
  );
}

const app = admin.initializeApp(
  { projectId: "demo-dream-closet-execution" },
  `execution-tests-${randomUUID()}`,
);

const db = app.firestore();

test.after(async () => {
  await app.delete();
});

const defaultResult = () => ({
  results: [{ id: "example-product", name: "Linen shirt" }],
  total: 1,
  page: 1,
  pageSize: 24,
  hasMore: false,
  warnings: [],
  sources: { example: 1 },
});

const deferred = () => {
  let resolve;

  const promise = new Promise((finish) => {
    resolve = finish;
  });

  return { promise, resolve };
};

const createFixture = async (provider) => {
  const uid = randomUUID();
  let nowMs = Date.parse("2026-11-19T18:00:00.000Z");
  let providerCalls = 0;

  await db.collection("users").doc(uid).set({
    firstName: "Execution",
    lastName: "Test",
  });

  const auth = {
    uid,
    token: {
      firebase: {
        sign_in_provider: "password",
      },
    },
  };

  const quotaService = createSearchQuotaService({
    db,
    clock: () => nowMs,
    getProPriceId: () => "price_test_pro",
  });

  const executionService = createSearchExecutionService({
    db,
    quotaService,
    clock: () => nowMs,
    performSearch: async (payload) => {
      providerCalls += 1;

      return provider ? provider(payload, providerCalls) : defaultResult();
    },
  });

  return {
    auth,
    quotaService,
    executionService,
    providerCalls: () => providerCalls,
    advance: (duration) => {
      nowMs += duration;
    },
  };
};

const run = (fixture, requestId, { action = "new", payload = {} } = {}) =>
  fixture.executionService.runSearch({
    auth: fixture.auth,
    requestId,
    action,
    payload: {
      query: "black linen shirt",
      gender: "",
      filters: {},
      sort: "relevance",
      page: 1,
      pageSize: 24,
      ...payload,
    },
  });

test("a successful duplicate returns cached results without another provider call", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  const first = await run(fixture, requestId);
  const second = await run(fixture, requestId, {
    action: "retry",
  });

  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(fixture.providerCalls(), 1);
  assert.equal(second.quota.used, 1);
  assert.deepEqual(second.results, first.results);
});

test("simultaneous duplicate execution calls the provider only once", async () => {
  const entered = deferred();
  const release = deferred();

  const fixture = await createFixture(async () => {
    entered.resolve();

    await release.promise;

    return defaultResult();
  });

  const requestId = randomUUID();
  const first = run(fixture, requestId);

  try {
    await entered.promise;

    await assert.rejects(
      run(fixture, requestId),
      (error) =>
        error.code === "unavailable" &&
        error.details.reason === "SEARCH_IN_PROGRESS",
    );

    assert.equal(fixture.providerCalls(), 1);
  } finally {
    release.resolve();
    await first;
  }

  const { quota } = await fixture.quotaService.getSearchQuota({
    auth: fixture.auth,
  });

  assert.equal(quota.used, 1);
});

test("sort, filters and page changes reuse the reservation", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await run(fixture, requestId);

  await run(fixture, requestId, {
    action: "refine",
    payload: { sort: "price_asc" },
  });

  await run(fixture, requestId, {
    action: "refine",
    payload: { filters: { color: ["black"] } },
  });

  const last = await run(fixture, requestId, {
    action: "refine",
    payload: { page: 2 },
  });

  assert.equal(fixture.providerCalls(), 4);
  assert.equal(last.quota.used, 1);
  assert.equal(last.quota.remaining, 4);
});

test("equivalent object key order shares one execution", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await run(fixture, requestId, {
    payload: {
      filters: {
        color: ["black"],
        size: ["m"],
      },
    },
  });

  const second = await run(fixture, requestId, {
    action: "retry",
    payload: {
      filters: {
        size: ["m"],
        color: ["black"],
      },
    },
  });

  assert.equal(second.cached, true);
  assert.equal(fixture.providerCalls(), 1);
});

test("provider failure consumes quota and explicit retry does not charge again", async () => {
  const fixture = await createFixture(async (payload, callCount) => {
    if (callCount === 1) {
      throw new Error("Simulated provider failure");
    }

    return defaultResult();
  });

  const requestId = randomUUID();

  await assert.rejects(
    run(fixture, requestId),
    (error) =>
      error.details.reason === "SEARCH_EXECUTION_FAILED" &&
      error.details.quota.used === 1,
  );

  await assert.rejects(
    run(fixture, requestId),
    (error) => error.details.reason === "SEARCH_RETRY_REQUIRED",
  );

  const retried = await run(fixture, requestId, {
    action: "retry",
  });

  assert.equal(fixture.providerCalls(), 2);
  assert.equal(retried.quota.used, 1);
  assert.equal(retried.cached, false);
});

test("concurrent retries of a failed execution start one replacement attempt", async () => {
  const entered = deferred();
  const release = deferred();

  const fixture = await createFixture(async (payload, callCount) => {
    if (callCount === 1) {
      throw new Error("Simulated initial failure");
    }

    entered.resolve();

    await release.promise;

    return defaultResult();
  });

  const requestId = randomUUID();

  await assert.rejects(
    run(fixture, requestId),
    (error) => error.details.reason === "SEARCH_EXECUTION_FAILED",
  );

  const retry = run(fixture, requestId, {
    action: "retry",
  });

  try {
    await entered.promise;

    await assert.rejects(
      run(fixture, requestId, { action: "retry" }),
      (error) => error.details.reason === "SEARCH_IN_PROGRESS",
    );

    assert.equal(fixture.providerCalls(), 2);
  } finally {
    release.resolve();
    await retry;
  }
});

test("a reused request ID cannot execute a different text query", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  await run(fixture, requestId);

  await assert.rejects(
    run(fixture, requestId, {
      action: "refine",
      payload: { query: "red leather boots" },
    }),
    (error) => error.details.reason === "REQUEST_ID_QUERY_MISMATCH",
  );

  assert.equal(fixture.providerCalls(), 1);
});

test("quota denial happens before providers execute", async () => {
  const fixture = await createFixture();

  for (let index = 0; index < 5; index += 1) {
    await run(fixture, randomUUID());
  }

  await assert.rejects(
    run(fixture, randomUUID()),
    (error) => error.details.reason === "SEARCH_QUOTA_EXHAUSTED",
  );

  assert.equal(fixture.providerCalls(), 5);
});

test("old running claims are not stolen automatically", async () => {
  const entered = deferred();
  const release = deferred();

  const fixture = await createFixture(async () => {
    entered.resolve();

    await release.promise;

    return defaultResult();
  });

  const requestId = randomUUID();
  const first = run(fixture, requestId);

  try {
    await entered.promise;

    fixture.advance(EXECUTION_WARNING_AFTER_MS);

    await assert.rejects(
      run(fixture, requestId, { action: "retry" }),
      (error) => error.details.reason === "SEARCH_EXECUTION_UNCERTAIN",
    );

    assert.equal(fixture.providerCalls(), 1);
  } finally {
    release.resolve();
    await first;
  }
});

test("cached results return current allowance rather than stale quota", async () => {
  const fixture = await createFixture();
  const requestId = randomUUID();

  const first = await run(fixture, requestId);

  await run(fixture, randomUUID());

  const cached = await run(fixture, requestId, {
    action: "retry",
  });

  assert.equal(first.quota.remaining, 4);
  assert.equal(cached.quota.remaining, 3);
  assert.equal(cached.cached, true);
});

test("malformed provider results remain charged and are not cached as success", async () => {
  const fixture = await createFixture(async () => ({
    unexpected: true,
  }));

  const requestId = randomUUID();

  await assert.rejects(
    run(fixture, requestId),
    (error) =>
      error.details.reason === "SEARCH_EXECUTION_FAILED" &&
      error.details.quota.used === 1,
  );

  await assert.rejects(
    run(fixture, requestId),
    (error) => error.details.reason === "SEARCH_RETRY_REQUIRED",
  );

  assert.equal(fixture.providerCalls(), 1);
});
