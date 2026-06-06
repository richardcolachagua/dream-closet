import { createDefaultFilters } from "./filterHelpers";

export const DEFAULT_SORT = "relevance";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 24;

export const ALLOWED_SORTS = ["relevance", "price_asc", "price_desc", "newest"];

const ARRAY_FILTER_KEYS = [
  "gender",
  "category",
  "size",
  "color",
  "brand",
  "store",
  "availability",
];

const normalizePage = (value) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
};

const normalizeSort = (value) =>
  ALLOWED_SORTS.includes(value) ? value : DEFAULT_SORT;

export function parseSearchState(searchString = "") {
  const params = new URLSearchParams(searchString);
  const filters = createDefaultFilters();

  ARRAY_FILTER_KEYS.forEach((key) => {
    const value = params.get(key);
    filters[key] = value
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  });

  filters.priceMin = params.get("priceMin")?.trim() || "";
  filters.priceMax = params.get("priceMax")?.trim() || "";

  return {
    query: params.get("query")?.trim() || "",
    sort: normalizeSort(params.get("sort")),
    page: normalizePage(params.get("page")),
    filters,
  };
}

export function buildSearchStateQuery({
  query = "",
  filters = createDefaultFilters(),
  sort = DEFAULT_SORT,
  page = DEFAULT_PAGE,
}) {
  const params = new URLSearchParams();

  if (query?.trim()) params.set("query", query.trim());
  const safeSort = normalizeSort(sort);
  if (safeSort !== DEFAULT_SORT) params.set("sort", safeSort);

  const safePage = normalizePage(page);
  if (safePage !== DEFAULT_PAGE) params.set("page", String(safePage));

  ARRAY_FILTER_KEYS.forEach((key) => {
    if (Array.isArray(filters[key]) && filters[key].length > 0) {
      params.set(
        key,
        filters[key]
          .map((v) => v?.toString().trim())
          .filter(Boolean)
          .join(","),
      );
    }
  });

  if (filters.priceMin) {
    params.set("priceMin", String(filters.priceMin).trim());
  }
  if (filters.priceMax) {
    params.set("priceMax", String(filters.priceMax).trim());
  }

  return params.toString();
}

export function hasActiveFilters(filters = {}) {
  return (
    ARRAY_FILTER_KEYS.some(
      (key) => Array.isArray(filters[key]) && filters[key].length > 0,
    ) ||
    Boolean(filters.priceMin) ||
    Boolean(filters.priceMax)
  );
}
