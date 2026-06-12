import { DEFAULT_FILTERS } from "./filterOptions";

export const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,
  gender: [...DEFAULT_FILTERS.gender],
  category: [...DEFAULT_FILTERS.category],
  size: [...DEFAULT_FILTERS.size],
  color: [...DEFAULT_FILTERS.color],
  brand: [...DEFAULT_FILTERS.brand],
  store: [...DEFAULT_FILTERS.store],
  availability: [...DEFAULT_FILTERS.availability],
});

export const isArrayFilterKey = (key) =>
  [
    "gender",
    "category",
    "size",
    "color",
    "brand",
    "store",
    "availability",
  ].includes(key);

export const toggleFilterValue = (filters, key, value) => {
  if (!isArrayFilterKey(key)) return filters;

  const currentValues = Array.isArray(filters[key]) ? filters[key] : [];
  const exists = currentValues.includes(value);

  return {
    ...filters,
    [key]: exists
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value],
  };
};

export const setPriceFilterValue = (filters, key, value) => {
  if (!["priceMin", "priceMax"].includes(key)) return filters;

  return {
    ...filters,
    [key]: value,
  };
};

export const clearFilterGroup = (filters, key) => {
  if (isArrayFilterKey(key)) {
    return {
      ...filters,
      [key]: [],
    };
  }

  if (["priceMin", "priceMax"].includes(key)) {
    return {
      ...filters,
      [key]: "",
    };
  }

  return filters;
};

export const clearAllFilters = () => createDefaultFilters();

export const removeFilterValue = (filters, key, value = null) => {
  if (isArrayFilterKey(key)) {
    return {
      ...filters,
      [key]: (filters[key] || []).filter((item) => item !== value),
    };
  }

  if (["priceMin", "priceMax"].includes(key)) {
    return {
      ...filters,
      [key]: "",
    };
  }

  if (key === "price") {
    return {
      ...filters,
      priceMin: "",
      priceMax: "",
    };
  }

  return filters;
};

export const parsePriceValue = (price) => {
  if (typeof price === "number") return price;
  if (!price || typeof price !== "string") return null;

  const normalized = price.replace(/,/g, "");
  const match = normalized.match(/(\d+(\.\d+)?)/);

  return match ? Number(match[1]) : null;
};

export const normalizeString = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const formatPriceLabel = (min, max) => {
  const hasMin = min !== "" && min !== null && min !== undefined;
  const hasMax = max !== "" && max !== null && max !== undefined;

  if (hasMin && hasMax) return `$${min} - $${max}`;
  if (hasMin) return `$${min}+`;
  if (hasMax) return `Up to $${max}`;
  return "";
};

export const getActiveFilterCount = (filters) => {
  if (!filters) return 0;

  let count = 0;

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      count += value.length;
      return;
    }

    if ((key === "priceMin" || key === "priceMax") && value !== "") {
      count += 1;
    }
  });

  if ((filters.priceMin !== "" || filters.priceMax !== "") && count > 1) {
    count -= Number(filters.priceMin !== "" && filters.priceMax !== "");
  }

  return count;
};

export const buildFilterChips = (filters) => {
  if (!filters) return [];

  const chips = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((item) => {
        chips.push({
          key,
          value: item,
          label: item,
        });
      });
    }
  });

  const priceLabel = formatPriceLabel(filters.priceMin, filters.priceMax);
  if (priceLabel) {
    chips.push({
      key: "price",
      value: "price",
      label: priceLabel,
    });
  }

  return chips;
};
