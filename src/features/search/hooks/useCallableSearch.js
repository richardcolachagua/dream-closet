import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCombinedResults,
  fetchSearchQuota,
} from "../services/fetchSearchResults";
import { createSearchOperation } from "../services/searchOperation";

export const searchErrorMessage = (error) => {
  switch (error?.details?.reason) {
    case "SEARCH_QUOTA_EXHAUSTED":
      return "Your new-search allowance is exhausted. Existing searches can still be refined or retried.";
    case "SEARCH_RATE_LIMIT":
      return "Too many requests. Wait a minute before trying again.";
    case "SEARCH_IN_PROGRESS":
      return "This search is still running. Wait briefly, then use Retry.";
    case "SEARCH_EXECUTION_UNCERTAIN": {
      const seconds = Math.ceil((error?.details?.retryAfterMs || 0) / 1000);
      return seconds > 0
        ? `The previous outcome is uncertain. Wait ${seconds} seconds, then use Retry without another new-search charge.`
        : "The previous outcome is uncertain. Use Retry to recover this search without another new-search charge.";
    }
    case "SEARCH_RESULT_UNCONFIRMED":
      return "The result could not be confirmed. Use Retry with the same search; a saved result will be reused if available.";
    case "SEARCH_EXECUTION_SUPERSEDED":
      return "A newer attempt owns this search. Use Retry to retrieve its result.";
    case "SEARCH_RECOVERY_LIMIT":
      return "This search reached its recovery limit. Start a new search when allowance is available.";
    case "SEARCH_RETRY_REQUIRED":
      return "Use Retry to continue this search without another new-search charge.";
    case "ACCOUNT_DELETION_IN_PROGRESS":
      return "Account deletion is in progress. Searching is disabled.";
    case "SEARCH_RESERVATION_EXPIRED":
      return "This search session expired. Submit a new text search to continue.";
    case "PROFILE_REQUIRED":
      return "Your profile is not ready. Sign out and sign in again.";
    default:
      return error?.message || "Search is unavailable. Please try again.";
  }
};

const mergeResults = (previous, incoming) => {
  const merged = new Map();
  for (const item of [...previous, ...incoming]) {
    const key = item.id || (item.productUrl ? `${item.source}:${item.productUrl}` : JSON.stringify(item));
    merged.set(key, item);
  }
  return [...merged.values()];
};

export const useCallableSearch = (identity) => {
  const mounted = useRef(false);
  const busy = useRef(null);
  const revision = useRef(0);
  const lastAppend = useRef(false);
  const [state, setState] = useState({
    response: null,
    quota: null,
    loading: false,
    quotaLoading: true,
    error: null,
    hasSearched: false,
    lastPayload: null,
    responsePayload: null,
  });
  const [operation] = useState(() => createSearchOperation({
    execute: (request) => fetchCombinedResults({
      ...request,
      expectedIdentity: identity,
    }),
  }));

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refreshQuota = useCallback(async () => {
    if (busy.current) return;
    const version = ++revision.current;
    try {
      const response = await fetchSearchQuota(identity);
      if (mounted.current && version === revision.current && !busy.current) {
        setState((previous) => ({
          ...previous,
          quota: response.quota,
          quotaLoading: false,
        }));
      }
    } catch (error) {
      if (mounted.current && version === revision.current && !busy.current) {
        setState((previous) => ({
          ...previous,
          quotaLoading: false,
          error,
        }));
      }
    }
  }, [identity]);

  useEffect(() => {
    void refreshQuota();
    const refresh = () => { void refreshQuota(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refreshQuota]);

  useEffect(() => {
    const reset = Date.parse(state.quota?.resetAt || "");
    if (!Number.isFinite(reset) || reset <= Date.now()) return undefined;
    const timeout = window.setTimeout(
      () => { void refreshQuota(); },
      Math.min(2147483647, Math.max(1000, reset - Date.now() + 500))
    );
    return () => window.clearTimeout(timeout);
  }, [state.quota, refreshQuota]);

  const run = useCallback((action, payload, append = false) => {
    if (busy.current) return busy.current;
    revision.current += 1;
    const appendResults = action === "retry" ? lastAppend.current : append;
    if (action !== "retry") lastAppend.current = append;
    if (mounted.current) {
      setState((previous) => ({
        ...previous,
        loading: true,
        hasSearched: true,
        error: null,
      }));
    }
    const task = operation[action](payload)
      .then((response) => {
        if (mounted.current) {
          setState((previous) => ({
            ...previous,
            response: {
              ...response,
              results: appendResults
                ? mergeResults(previous.response?.results || [], response.results)
                : response.results,
            },
            quota: response.quota,
            quotaLoading: false,
            lastPayload: operation.current()?.payload,
            responsePayload: operation.current()?.payload,
          }));
        }
        return response;
      })
      .catch((error) => {
        if (mounted.current) {
          setState((previous) => ({
            ...previous,
            error,
            quota: error?.details?.quota || previous.quota,
            lastPayload: operation.current()?.payload || previous.lastPayload,
          }));
        }
        return null;
      })
      .finally(() => {
        busy.current = null;
        revision.current += 1;
        if (mounted.current) {
          setState((previous) => ({ ...previous, loading: false, quotaLoading: false }));
        }
      });
    busy.current = task;
    return task;
  }, [operation]);

  return {
    ...state,
    submit: (payload) => run("submit", payload),
    refine: (payload, append = false) => run("refine", payload, append),
    retry: () => run("retry", undefined, false),
    refreshQuota,
  };
};
