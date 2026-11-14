import { runTransaction, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ensureUserProfile, finishAccountSignIn } from "./profileService";

jest.mock("../../backend/firebase/firebase", () => ({
  auth: {},
  db: {},
  authReady: Promise.resolve(),
}));
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "profile-reference"),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(() => "server-timestamp"),
}));
jest.mock("firebase/auth", () => ({
  browserSessionPersistence: "session",
  setPersistence: jest.fn(),
  signOut: jest.fn(),
}));
const user = {
  uid: "alice",
  email: "alice@example.com",
  isAnonymous: false,
  displayName: "Alice Example",
};
let transaction;
beforeEach(() => {
  jest.clearAllMocks();
  transaction = { get: jest.fn(), set: jest.fn() };
  runTransaction.mockImplementation((_db, callback) => callback(transaction));
});
test("returning user preferences and subscription are returned without writes", async () => {
  const existing = {
    firstName: "Existing",
    preferences: { emailNotifications: true },
    onboarding: { completed: true },
    subscription: { status: "active" },
    customerId: "customer",
  };
  transaction.get.mockResolvedValue({
    exists: () => true,
    data: () => existing,
  });
  expect(await ensureUserProfile(user, { firstName: "Replacement" })).toBe(
    existing,
  );
  expect(transaction.set).not.toHaveBeenCalled();
});
test("first-time Google and email initialization use the same field structure", async () => {
  transaction.get.mockResolvedValue({ exists: () => false });
  await ensureUserProfile(user);
  const google = transaction.set.mock.calls[0][1];
  transaction.set.mockClear();
  await ensureUserProfile(
    { ...user, displayName: null },
    { firstName: "Alice", lastName: "Example" },
  );
  const email = transaction.set.mock.calls[0][1];
  expect(email).toEqual(google);
  expect(email).not.toHaveProperty("subscription");
  expect(email.preferences.emailNotifications).toBe(false);
  expect(serverTimestamp).toHaveBeenCalled();
});
test("anonymous users cannot initialize profiles", async () => {
  await expect(
    ensureUserProfile({ ...user, isAnonymous: true }),
  ).rejects.toThrow();
  expect(transaction.set).not.toHaveBeenCalled();
});
test("profile failure is recoverable and signs out without deleting Auth", async () => {
  transaction.get.mockRejectedValue(new Error("Firestore unavailable"));
  await expect(finishAccountSignIn(user)).rejects.toMatchObject({
    code: "profile/initialization-failed",
  });
  expect(signOut).toHaveBeenCalledTimes(1);
});
