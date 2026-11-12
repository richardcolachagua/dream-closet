const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createProfileHandler,
} = require("../../functions/profile/profileHandler");
const {
  validateProfileData,
  isRecentlyAuthenticated,
} = require("../../functions/profile/profileValidation");
class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
const context = {
  auth: { uid: "alice", token: { firebase: { sign_in_provider: "password" } } },
};
const fixture = (options = {}) => {
  let stored = options.missing
    ? null
    : {
        firstName: "Alice",
        lastName: "Example",
        email: "alice@example.com",
        subscription: { status: "active" },
        preferences: { emailNotifications: true },
      };
  let authCalls = 0;
  const reference = {
    get: async () => ({ exists: Boolean(stored), data: () => stored }),
  };
  const db = {
    collection: () => ({ doc: () => reference }),
    runTransaction: async (callback) =>
      callback({
        get: reference.get,
        update: (_reference, changes) => {
          stored = { ...stored, ...changes };
        },
      }),
  };
  const admin = {
    firestore: { FieldValue: { serverTimestamp: () => "server-time" } },
    auth: () => ({
      updateUser: async () => {
        authCalls += 1;
        if (options.authFailure) throw new Error("Auth unavailable");
      },
    }),
  };
  return {
    handler: createProfileHandler({
      db,
      admin,
      HttpsError,
      logger: { error() {}, warn() {} },
    }),
    stored: () => stored,
    authCalls: () => authCalls,
  };
};
test("validation rejects malformed input and all non-name fields", () => {
  for (const input of [
    null,
    [],
    {},
    { firstName: 0 },
    { lastName: false },
    { firstName: "x".repeat(61) },
    { email: "alice@example.com" },
    { subscription: {} },
    { admin: true },
  ]) {
    assert.ok(validateProfileData(input).length);
  }
  assert.deepEqual(
    validateProfileData({ firstName: "", lastName: "Example" }),
    [],
  );
});
test("callable denies unauthenticated and anonymous users", async () => {
  const f = fixture();
  await assert.rejects(f.handler({ firstName: "Bob" }, {}), {
    code: "unauthenticated",
  });
  await assert.rejects(
    f.handler(
      { firstName: "Bob" },
      {
        auth: {
          uid: "alice",
          token: { firebase: { sign_in_provider: "anonymous" } },
        },
      },
    ),
    { code: "unauthenticated" },
  );
});
test("callable rejects email and billing forgery", async () => {
  const f = fixture();
  for (const input of [
    { email: "new@example.com" },
    { subscription: {} },
    { customerId: "fake" },
    { admin: true },
  ]) {
    await assert.rejects(f.handler(input, context), {
      code: "invalid-argument",
    });
  }
  assert.equal(f.authCalls(), 0);
});
test("callable updates names and preserves server data", async () => {
  const f = fixture();
  const result = await f.handler({ firstName: "  Alice   Jane  " }, context);
  assert.equal(f.stored().firstName, "Alice Jane");
  assert.equal(f.stored().lastName, "Example");
  assert.equal(f.stored().email, "alice@example.com");
  assert.equal(f.stored().subscription.status, "active");
  assert.equal(f.stored().preferences.emailNotifications, true);
  assert.equal(result.authDisplayNameSynced, true);
});
test("missing profile is not recreated by the Admin callable", async () => {
  const f = fixture({ missing: true });
  await assert.rejects(f.handler({ firstName: "Bob" }, context), {
    code: "failed-precondition",
  });
  assert.equal(f.stored(), null);
});
test("display name sync failure returns an explicit partial-success result", async () => {
  const f = fixture({ authFailure: true });
  const result = await f.handler({ firstName: "Bob" }, context);
  assert.equal(f.stored().firstName, "Bob");
  assert.equal(result.authDisplayNameSynced, false);
});
test("recent auth rejects future and malformed timestamps", () => {
  for (const value of ["123", Infinity, Math.floor(Date.now() / 1000) + 100]) {
    assert.equal(
      isRecentlyAuthenticated({ auth: { token: { auth_time: value } } }),
      false,
    );
  }
});
