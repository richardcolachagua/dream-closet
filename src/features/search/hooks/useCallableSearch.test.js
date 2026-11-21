import { act, renderHook, waitFor } from "@testing-library/react";
import { useCallableSearch } from "./useCallableSearch";
import {
  fetchCombinedResults,
  fetchSearchQuota,
} from "../services/fetchSearchResults";

jest.mock("../services/fetchSearchResults", () => ({
  fetchCombinedResults: jest.fn(),
  fetchSearchQuota: jest.fn(),
}));

let originalCryptoDescriptor;

beforeEach(() => {
  fetchCombinedResults.mockReset();

  fetchSearchQuota.mockReset().mockResolvedValue({
    quota: {
      remaining: 5,
    },
  });

  originalCryptoDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "crypto",
  );

  let id = 0;

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      randomUUID: () => `test-request-${++id}`,
    },
  });
});

afterEach(() => {
  if (originalCryptoDescriptor) {
    Object.defineProperty(globalThis, "crypto", originalCryptoDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "crypto");
  }
});

const resultPage = (page, remaining = 4) => ({
  results: [
    {
      id: `item-${page}`,
    },
  ],
  page,
  quota: {
    remaining,
  },
  hasMore: true,
});

test("refinements and retries keep one reservation ID", async () => {
  fetchCombinedResults.mockResolvedValue(resultPage(1));

  const { result } = renderHook(() => useCallableSearch("alice:registered"));

  await act(async () => {
    await result.current.submit({
      query: "shirt",
      page: 1,
    });
  });

  await act(async () => {
    await result.current.refine(
      {
        page: 2,
      },
      true,
    );
  });

  await act(async () => {
    await result.current.retry();
  });

  const calls = fetchCombinedResults.mock.calls.map(([value]) => value);

  expect(new Set(calls.map((value) => value.requestId)).size).toBe(1);

  expect(calls.map((value) => value.action)).toEqual([
    "new",
    "refine",
    "retry",
  ]);
});

test("retrying a failed load-more appends rather than replacing earlier pages", async () => {
  fetchCombinedResults
    .mockResolvedValueOnce(resultPage(1))
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(resultPage(2));

  const { result } = renderHook(() => useCallableSearch("alice:registered"));

  await act(async () => {
    await result.current.submit({
      query: "shirt",
      page: 1,
    });
  });

  await act(async () => {
    await result.current.refine(
      {
        page: 2,
      },
      true,
    );
  });

  await act(async () => {
    await result.current.retry();
  });

  expect(result.current.response.results.map((item) => item.id)).toEqual([
    "item-1",
    "item-2",
  ]);
});

test("a failed request updates remaining usage from structured error details", async () => {
  const error = Object.assign(new Error("exhausted"), {
    details: {
      quota: {
        remaining: 0,
      },
      reason: "SEARCH_QUOTA_EXHAUSTED",
    },
  });

  fetchCombinedResults.mockRejectedValue(error);

  const { result } = renderHook(() => useCallableSearch("alice:registered"));

  await act(async () => {
    await result.current.submit({
      query: "shirt",
    });
  });

  expect(result.current.quota.remaining).toBe(0);

  expect(result.current.error.details.reason).toBe("SEARCH_QUOTA_EXHAUSTED");
});

test("unmounting for an account switch does not carry results into the next account", async () => {
  let finish;

  fetchCombinedResults.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );

  const { result: aliceResult, unmount: unmountAlice } = renderHook(() =>
    useCallableSearch("alice:registered"),
  );

  let pending;

  act(() => {
    pending = aliceResult.current.submit({
      query: "shirt",
    });
  });

  await waitFor(() => {
    expect(fetchCombinedResults).toHaveBeenCalledTimes(1);
  });

  unmountAlice();

  const { result: bobResult } = renderHook(() =>
    useCallableSearch("bob:registered"),
  );

  await act(async () => {
    finish(resultPage(1));
    await pending;
  });

  expect(bobResult.current.response).toBeNull();
  expect(bobResult.current.hasSearched).toBe(false);
});
