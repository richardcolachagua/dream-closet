import { httpsCallable } from "firebase/functions";
import {
  authReady,
  functions,
} from "../../../backend/firebase/firebase";
import { assertSearchIdentity } from "./searchSession";

const searchCallable = httpsCallable(functions, "searchProducts", {
  timeout: 125000,
});
const quotaCallable = httpsCallable(functions, "checkSearchLimit");

export const normalizePriceInput = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value.trim()))
  ) {
    throw new Error("Enter a valid non-negative price.");
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0 || result > 1000000) {
    throw new Error("Prices must be between 0 and 1,000,000.");
  }
  return result;
};

export const buildCallablePayload = ({
  requestId,
  action = "new",
  query,
  filters = {},
  onboardingGender = "",
  sort = "relevance",
  page = 1,
  pageSize = 24,
}) => ({
  requestId,
  action,
  query,
  gender: onboardingGender || "",
  filters: {
    ...filters,
    priceMin: normalizePriceInput(filters.priceMin),
    priceMax: normalizePriceInput(filters.priceMax),
  },
  sort,
  page,
  pageSize,
});

const callForIdentity = async (callable, payload, expectedIdentity) => {
  await authReady;
  assertSearchIdentity(expectedIdentity);
  try {
    const response = await callable(payload);
    assertSearchIdentity(expectedIdentity);
    return response.data;
  } catch (error) {
    assertSearchIdentity(expectedIdentity);
    throw error;
  }
};

export const fetchCombinedResults = async (options) => {
  const payload = buildCallablePayload(options);
  return callForIdentity(searchCallable, payload, options.expectedIdentity);
};

export const fetchSearchQuota = async (expectedIdentity) =>
  callForIdentity(quotaCallable, {}, expectedIdentity);

export default fetchCombinedResults;
