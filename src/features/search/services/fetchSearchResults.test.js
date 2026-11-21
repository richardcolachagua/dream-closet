import { httpsCallable } from "firebase/functions";
import { auth } from "../../../backend/firebase/firebase";
import { fetchCombinedResults, fetchSearchQuota, buildCallablePayload } from "./fetchSearchResults";

jest.mock("firebase/functions", () => ({
  httpsCallable: jest.fn(() => jest.fn()),
}));
jest.mock("firebase/auth", () => ({ signInAnonymously: jest.fn() }));
jest.mock("../../../backend/firebase/firebase", () => ({
  auth: { currentUser: null },
  authReady: Promise.resolve(),
  functions: {},
}));

const callables = new Map(httpsCallable.mock.calls.map((args, index) => [
  args[1], httpsCallable.mock.results[index].value,
]));
const callable = (name) => callables.get(name);

beforeEach(() => {
  auth.currentUser = { uid: "alice", isAnonymous: false };
  callable("searchProducts").mockReset();
  callable("checkSearchLimit").mockReset();
});

test("transport sends direct callable payload and preserves metadata", async () => {
  const response = { results: [], quota: { remaining: 4 }, cached: true };
  callable("searchProducts").mockResolvedValue({ data: response });
  const result = await fetchCombinedResults({
    query: "shirt", requestId: "request-id", expectedIdentity: "alice:registered",
    filters: { priceMin: "0", priceMax: "25.50" },
  });
  expect(result).toBe(response);
  expect(callable("searchProducts")).toHaveBeenCalledWith(expect.objectContaining({
    query: "shirt", requestId: "request-id", action: "new",
    filters: { priceMin: 0, priceMax: 25.5 },
  }));
  expect(callable("searchProducts").mock.calls[0][0].data).toBeUndefined();
});

test("structured callable errors retain their identity and details", async () => {
  const error = Object.assign(new Error("exhausted"), {
    code: "functions/resource-exhausted", details: { quota: { remaining: 0 } },
  });
  callable("searchProducts").mockRejectedValue(error);
  await expect(fetchCombinedResults({ query: "shirt", expectedIdentity: "alice:registered" })).rejects.toBe(error);
});

test("identity mismatch prevents a request", async () => {
  await expect(fetchSearchQuota("bob:registered")).rejects.toMatchObject({ code: "search/account-changed" });
  expect(callable("checkSearchLimit")).not.toHaveBeenCalled();
});

test("an account change during the request discards its response", async () => {
  callable("checkSearchLimit").mockImplementation(async () => {
    auth.currentUser = { uid: "bob", isAnonymous: false };
    return { data: { quota: { remaining: 5 } } };
  });
  await expect(fetchSearchQuota("alice:registered")).rejects.toMatchObject({ code: "search/account-changed" });
});

test("invalid price inputs are rejected without numeric coercion surprises", () => {
  for (const value of ["   ", "abc", -1, Infinity, true]) {
    expect(() => buildCallablePayload({ filters: { priceMin: value } })).toThrow();
  }
});
