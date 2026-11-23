import {searchErrorMessage} from "./useCallableSearch";

jest.mock("../services/fetchSearchResults", () => ({
  fetchCombinedResults: jest.fn(),
  fetchSearchQuota: jest.fn(),
}));

test("uncertain execution shows the server recovery wait", () => {
  expect(searchErrorMessage({details: {
    reason: "SEARCH_EXECUTION_UNCERTAIN", retryAfterMs: 90000,
  }})).toContain("Wait 90 seconds");
});

test.each([
  ["SEARCH_EXECUTION_SUPERSEDED", "newer attempt"],
  ["SEARCH_RECOVERY_LIMIT", "recovery limit"],
  ["SEARCH_RESULT_UNCONFIRMED", "saved result"],
  ["ACCOUNT_DELETION_IN_PROGRESS", "Searching is disabled"],
])("%s has an actionable message", (reason, message) => {
  expect(searchErrorMessage({details: {reason}})).toContain(message);
});
