import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, authReady, db } from "../../backend/firebase/firebase";
import catalog from "../../shared/data/profileCatalog.json";
import { buildSavedItemPayload } from "../search/utils/buildSavedItemPayload";

export const requireSavedDataUser = async (uid) => {
  await authReady;

  const user = auth.currentUser;

  if (!user || user.isAnonymous || user.uid !== uid) {
    throw new Error(
      "Sign in to a registered account to save items or searches.",
    );
  }

  return user;
};

const normalizePriceLimit = (value) => {
  if (value == null || value === "") {
    return null;
  }

  const isNumericString =
    typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim());

  if (typeof value !== "number" && !isNumericString) {
    throw new Error("Price limits must be non-negative numbers.");
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1000000) {
    throw new Error("Price limits must be between 0 and 1,000,000.");
  }

  return numeric;
};

export const buildSavedSearchPayload = ({
  query,
  filters = {},
  sort = "relevance",
  page = 1,
}) => {
  if (typeof query !== "string" || !query.trim() || query.trim().length > 500) {
    throw new Error("Enter a search between 1 and 500 characters.");
  }

  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new Error("Invalid filters.");
  }

  const allowedKeys = [...Object.keys(catalog.filters), "priceMin", "priceMax"];

  if (Object.keys(filters).some((key) => !allowedKeys.includes(key))) {
    throw new Error("Unsupported filter field.");
  }

  const normalizedFilters = {};

  for (const [key, allowedValues] of Object.entries(catalog.filters)) {
    const selectedValues = filters[key] ?? [];

    if (
      !Array.isArray(selectedValues) ||
      selectedValues.some((value) => !allowedValues.includes(value))
    ) {
      throw new Error(`Invalid ${key} filter.`);
    }

    normalizedFilters[key] = [...new Set(selectedValues)];
  }

  normalizedFilters.priceMin = normalizePriceLimit(filters.priceMin);
  normalizedFilters.priceMax = normalizePriceLimit(filters.priceMax);

  if (
    normalizedFilters.priceMin != null &&
    normalizedFilters.priceMax != null &&
    normalizedFilters.priceMin > normalizedFilters.priceMax
  ) {
    throw new Error("Minimum price cannot exceed maximum price.");
  }

  if (
    !catalog.sorts.includes(sort) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 1000
  ) {
    throw new Error("Invalid sort or page.");
  }

  return {
    query: query.trim(),
    filters: normalizedFilters,
    sort,
    page,
    createdAt: serverTimestamp(),
  };
};

export const savedItemReference = async (uid, item) => {
  const payload = buildSavedItemPayload(item);

  const identity = JSON.stringify([
    payload.source.toLowerCase(),
    payload.productUrl,
  ]);

  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(identity),
  );

  const id = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return doc(db, "users", uid, "savedItems", id);
};

export const saveItem = async (uid, item) => {
  await requireSavedDataUser(uid);

  const reference = await savedItemReference(uid, item);
  const payload = buildSavedItemPayload(item);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists()) {
      transaction.set(reference, payload);
    }
  });

  return reference;
};

export const toggleSavedItem = async (uid, item) => {
  await requireSavedDataUser(uid);

  const reference = await savedItemReference(uid, item);
  const payload = buildSavedItemPayload(item);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (snapshot.exists()) {
      transaction.delete(reference);
      return false;
    }

    transaction.set(reference, payload);
    return true;
  });
};

export const saveSearch = async (uid, search) => {
  await requireSavedDataUser(uid);

  const payload = buildSavedSearchPayload(search);
  const reference = collection(db, "users", uid, "savedSearches");

  return addDoc(reference, payload);
};
