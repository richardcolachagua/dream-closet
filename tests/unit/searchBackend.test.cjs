const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { createRequire } = require("node:module");
const path = require("node:path");

const requireFromFunctions = createRequire(
  path.resolve(__dirname, "../../functions/package.json"),
);

const { HttpsError } = requireFromFunctions("firebase-functions/v1/https");
const {
  FILTER_VALUES,
  SORTS,
  validateSearchRequest,
} = require("../../functions/search/utils/searchValidation");

const {
  createSearchHandlers,
} = require("../../functions/search/searchHandlers");

const catalog = require("../../src/shared/data/profileCatalog.json");

const context = (anonymous = false) => ({
  auth: {
    uid: "backend-test-user",
    token: {
      firebase: {
        sign_in_provider: anonymous ? "anonymous" : "password",
      },
    },
  },
});

const request = (overrides = {}) => ({
  requestId: randomUUID(),
  query: "Black linen shirt",
  action: "new",
  ...overrides,
});

const invalid = (operation) =>
  assert.throws(operation, (error) => error.code === "invalid-argument");

const fixture = ({
  runSearch = async () => ({
    results: [],
    quota: { tier: "free", remaining: 4 },
  }),
  getSearchQuota = async () => ({
    quota: { tier: "free", remaining: 5 },
  }),
} = {}) => {
  const calls = {
    execution: [],
    quota: [],
    errors: [],
  };

  const handlers = createSearchHandlers({
    executionService: {
      runSearch: async (value) => {
        calls.execution.push(value);
        return runSearch(value);
      },
    },
    quotaService: {
      getSearchQuota: async (value) => {
        calls.quota.push(value);
        return getSearchQuota(value);
      },
    },
    logger: {
      error: (...args) => calls.errors.push(args),
    },
  });

  return { handlers, calls };
};

test("server filter vocabulary matches the shared catalog", () => {
  assert.deepEqual(FILTER_VALUES, catalog.filters);
  assert.deepEqual(SORTS, catalog.sorts);
});

test("valid requests receive canonical payload defaults", () => {
  const result = validateSearchRequest(
    request({
      query: "  BLACK   linen shirt  ",
    }),
  );

  assert.equal(result.payload.query, "black linen shirt");
  assert.equal(result.payload.gender, "");
  assert.equal(result.payload.page, 1);
  assert.equal(result.payload.pageSize, 24);
  assert.equal(result.payload.sort, "relevance");
  assert.equal(result.payload.filters.priceMin, null);
  assert.equal(result.payload.filters.priceMax, null);
  assert.deepEqual(result.payload.filters.color, []);
});

test("null, array and non-object search requests are rejected", () => {
  for (const value of [null, undefined, [], "query", 42]) {
    invalid(() => validateSearchRequest(value));
  }
});

test("query length and request IDs are bounded", () => {
  for (const query of ["", "   ", null, [], "x".repeat(251)]) {
    invalid(() => validateSearchRequest(request({ query })));
  }

  for (const requestId of ["short", "a/b".repeat(8), null, 123]) {
    invalid(() => validateSearchRequest(request({ requestId })));
  }
});

test("pagination requires bounded integers without string coercion", () => {
  for (const page of [0, -1, 1.5, "2", null, 1001, Infinity]) {
    invalid(() => validateSearchRequest(request({ page })));
  }

  for (const pageSize of [0, 1.5, "24", null, 49]) {
    invalid(() => validateSearchRequest(request({ pageSize })));
  }
});

test("unsupported fields cannot forge identity or tier", () => {
  for (const field of ["uid", "tier", "subscription", "admin", "data"]) {
    invalid(() => validateSearchRequest(request({ [field]: "forged" })));
  }
});

test("sort, action and gender values are validated", () => {
  invalid(() => validateSearchRequest(request({ sort: "unsupported" })));

  invalid(() => validateSearchRequest(request({ action: "reset-quota" })));

  for (const gender of [null, [], "unexpected"]) {
    invalid(() => validateSearchRequest(request({ gender })));
  }
});

test("filter object, keys, element types, counts and duplicates are validated", () => {
  for (const filters of [
    null,
    [],
    { unknown: [] },
    { color: "black" },
    { color: [123] },
    { color: ["not-a-color"] },
    { color: ["black", "black"] },
    { gender: ["female", "male", "unisex", "female"] },
  ]) {
    invalid(() => validateSearchRequest(request({ filters })));
  }
});

test("price bounds and numeric types are validated", () => {
  for (const filters of [
    { priceMin: -1 },
    { priceMax: 1000001 },
    { priceMin: "10" },
    { priceMax: Infinity },
    { priceMin: NaN },
    { priceMin: 20, priceMax: 10 },
  ]) {
    invalid(() => validateSearchRequest(request({ filters })));
  }

  const result = validateSearchRequest(
    request({
      filters: { priceMin: 0, priceMax: 0 },
    }),
  );

  assert.equal(result.payload.filters.priceMin, 0);
  assert.equal(result.payload.filters.priceMax, 0);
});

test("equivalent filter order produces the same normalized payload", () => {
  const first = validateSearchRequest(
    request({
      filters: { color: ["white", "black"] },
    }),
  );

  const second = validateSearchRequest(
    request({
      filters: { color: ["black", "white"] },
    }),
  );

  assert.deepEqual(first.payload, second.payload);
});

test("missing identity is rejected before execution", async () => {
  const { handlers, calls } = fixture();

  await assert.rejects(
    handlers.searchProducts(request(), {}),
    (error) => error.code === "unauthenticated",
  );

  assert.equal(calls.execution.length, 0);
});

test("invalid payload is rejected before execution and quota reservation", async () => {
  const { handlers, calls } = fixture();

  await assert.rejects(
    handlers.searchProducts(request({ filters: [] }), context()),
    (error) => error.code === "invalid-argument",
  );

  assert.equal(calls.execution.length, 0);
  assert.equal(calls.quota.length, 0);
});

test("anonymous sessions may execute visitor searches", async () => {
  const { handlers, calls } = fixture();

  await handlers.searchProducts(request(), context(true));

  assert.equal(calls.execution.length, 1);
  assert.equal(
    calls.execution[0].auth.token.firebase.sign_in_provider,
    "anonymous",
  );
});

test("handler forwards normalized request and preserves response metadata", async () => {
  const response = {
    results: [{ id: "example" }],
    requestId: "example-request-id",
    quota: { tier: "free", remaining: 4 },
    cached: true,
    reservationReused: true,
  };

  const { handlers, calls } = fixture({
    runSearch: async () => response,
  });

  const input = request({
    action: "retry",
    query: "  BLACK shirt ",
  });

  const result = await handlers.searchProducts(input, context());

  assert.strictEqual(result, response);
  assert.equal(calls.execution[0].requestId, input.requestId);
  assert.equal(calls.execution[0].action, "retry");
  assert.equal(calls.execution[0].payload.query, "black shirt");
});

test("structured quota errors are preserved unchanged", async () => {
  const expected = new HttpsError("resource-exhausted", "Allowance exhausted", {
    reason: "SEARCH_QUOTA_EXHAUSTED",
    quota: { remaining: 0 },
  });

  const { handlers } = fixture({
    runSearch: async () => {
      throw expected;
    },
  });

  await assert.rejects(
    handlers.searchProducts(request(), context()),
    (error) => error === expected,
  );
});

test("unexpected errors do not expose private details", async () => {
  const { handlers, calls } = fixture({
    runSearch: async () => {
      throw new Error("private provider credential details");
    },
  });

  await assert.rejects(
    handlers.searchProducts(request(), context()),
    (error) =>
      error.code === "internal" &&
      error.details.reason === "SEARCH_INTERNAL_ERROR" &&
      !error.message.includes("credential"),
  );

  assert.equal(calls.errors.length, 1);
});

test("quota handler returns server metadata without executing a search", async () => {
  const expected = {
    quota: {
      tier: "free",
      remaining: 3,
      resetAt: "2026-11-20T05:00:00.000Z",
    },
  };

  const { handlers, calls } = fixture({
    getSearchQuota: async () => expected,
  });

  const result = await handlers.checkSearchLimit({}, context());

  assert.strictEqual(result, expected);
  assert.equal(calls.quota.length, 1);
  assert.equal(calls.execution.length, 0);
});

test("quota handler rejects unauthenticated and forged requests", async () => {
  const { handlers, calls } = fixture();

  await assert.rejects(
    handlers.checkSearchLimit({}, {}),
    (error) => error.code === "unauthenticated",
  );

  await assert.rejects(
    handlers.checkSearchLimit({ tier: "pro" }, context()),
    (error) => error.code === "invalid-argument",
  );

  assert.equal(calls.quota.length, 0);
});

test("quota handler supports anonymous sessions and an empty callable argument", async () => {
  const { handlers, calls } = fixture();

  await handlers.checkSearchLimit(null, context(true));

  assert.equal(calls.quota.length, 1);
  assert.equal(calls.execution.length, 0);
});
