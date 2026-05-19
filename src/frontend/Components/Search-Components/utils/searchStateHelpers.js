import { createDefaultFilters } from "./filterHelpers";

export const DEFAULT_SORT = "relevance";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 24;

const ARRAY_FILTER_KEYS = [
  "gender",
  "category",
  "size",
  "color",
  "brand",
  "store",
  "availability",
];

export function parseSearchState(searchString = "") {
  const params = new URLSearchParams(searchString);
  const defaultFilters = createDefaultFilters();

  ARRAY_FILTER_KEYS.forEach((key) => {
    const value = params.get(key);
    defaultFilters[key] = value ? value.split(",").filter(Boolean) : [];
  });

  defaultFilters.priceMin = params.get("priceMin") || "";
  defaultFilters.priceMax = params.get("priceMax") || "";

  return {
    query: params.get("query") || "",
    sort: params.get("sort") || DEFAULT_SORT,
    page: Number(params.get("page") || DEFAULT_PAGE),
    filters: defaultFilters,
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
  if (sort && sort !== DEFAULT_SORT) params.set("sort", sort);
  if (page && page !== DEFAULT_PAGE) params.set("page", String(page));

  ARRAY_FILTER_KEYS.forEach((key) => {
    if (Array.isArray(filters[key]) && filters[key].length > 0) {
      params.set(key, filters[key].join(","));
    }
  });

  if (filters.priceMin) params.set("priceMin", filters.priceMin);
  if (filters.priceMax) params.set("priceMax", filters.priceMax);

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
