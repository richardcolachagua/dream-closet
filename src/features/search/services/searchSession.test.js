import { signInAnonymously } from "firebase/auth";
import { auth } from "../../../backend/firebase/firebase";
import { ensureVisitorSession, searchIdentity } from "./searchSession";

jest.mock("firebase/auth", () => ({ signInAnonymously: jest.fn() }));
jest.mock("../../../backend/firebase/firebase", () => ({
  auth: { currentUser: null, authStateReady: jest.fn().mockResolvedValue() },
  authReady: Promise.resolve(),
}));

beforeEach(() => {
  auth.currentUser = null;
  signInAnonymously.mockReset();
});

test("restored registered sessions are never replaced by anonymous sign-in", async () => {
  const user = { uid: "alice", isAnonymous: false };
  auth.currentUser = user;
  await expect(ensureVisitorSession()).resolves.toBe(user);
  expect(signInAnonymously).not.toHaveBeenCalled();
});

test("concurrent visitor initialization shares one anonymous sign-in", async () => {
  const user = { uid: "visitor", isAnonymous: true };
  signInAnonymously.mockResolvedValue({ user });
  const results = await Promise.all([ensureVisitorSession(), ensureVisitorSession()]);
  expect(signInAnonymously).toHaveBeenCalledTimes(1);
  expect(results).toEqual([user, user]);
});

test("failed initialization can be retried", async () => {
  signInAnonymously.mockRejectedValueOnce(new Error("offline"));
  signInAnonymously.mockResolvedValueOnce({ user: { uid: "visitor", isAnonymous: true } });
  await expect(ensureVisitorSession()).rejects.toThrow("offline");
  await expect(ensureVisitorSession()).resolves.toMatchObject({ uid: "visitor" });
});

test("linking an anonymous UID changes the search identity", () => {
  expect(searchIdentity({ uid: "same", isAnonymous: true })).toBe("same:visitor");
  expect(searchIdentity({ uid: "same", isAnonymous: false })).toBe("same:registered");
});
