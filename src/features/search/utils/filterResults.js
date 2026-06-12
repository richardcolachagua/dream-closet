import {
  CATEGORY_KEYWORDS,
  COLOR_KEYWORDS,
  GENDER_KEYWORDS,
} from "./filterOptions";
import { normalizeString, parsePriceValue } from "./filterHelpers";

const includesKeyword = (text, keywords = []) =>
  keywords.some((keyword) => text.includes(keyword));

const inferCategory = (productName) => {
  const normalizedName = normalizeString(productName);

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) {
      return category;
    }
  }

  return "unknown";
};

const inferColors = (productName) => {
  const normalizedName = normalizeString(productName);
  const matches = [];

  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) {
      matches.push(color);
    }
  }

  return matches;
};

const inferGender = (productName) => {
  const normalizedName = normalizeString(productName);

  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) {
      return gender;
    }
  }

  return "unknown";
};

const inferAvailability = (product) => {
  if (typeof product?.inStock === "boolean") {
    return product.inStock ? "in_stock" : "out_of_stock";
  }

  if (product?.availability) {
    const normalizedAvailability = normalizeString(product.availability);

    if (
      normalizedAvailability.includes("in stock") ||
      normalizedAvailability.includes("available")
    ) {
      return "in_stock";
    }

    if (
      normalizedAvailability.includes("out of stock") ||
      normalizedAvailability.includes("unavailable") ||
      normalizedAvailability.includes("sold out")
    ) {
      return "out_of_stock";
    }
  }

  return "unknown";
};

const inferBrand = (product, fallbackSource) => {
  return (
    product?.brandName ||
    product?.brand ||
    product?.offer?.store_name ||
    fallbackSource ||
    ""
  );
};

const normalizeAsosProduct = (product) => {
  const name = product?.name || "";
  const numericPrice =
    product?.price?.current?.value ??
    parsePriceValue(product?.price?.current?.text);

  return {
    itemId: product?.id || "",
    name,
    price: product?.price?.current?.text || "Price unavailable",
    numericPrice,
    imageUrl: product?.imageUrl ? `https://${product.imageUrl}` : "",
    productUrl: product?.url ? `https://www.asos.com/${product.url}` : "",
    source: "ASOS",
    brand: inferBrand(product, "ASOS"),
    gender: inferGender(name),
    category: inferCategory(name),
    size: [],
    color: inferColors(name),
    availability: inferAvailability(product),
    material: [],
    rawData: product,
  };
};

const normalizeRealtimeProduct = (product) => {
  const name = product?.product_title || "";
  const rawPrice = product?.offer?.price || "Price unavailable";

  return {
    itemId: product?.product_id || "",
    name,
    price: rawPrice,
    numericPrice: parsePriceValue(rawPrice),
    imageUrl: product?.product_photos?.[0] || "",
    productUrl: product?.offer?.offer_page_url || "",
    source: product?.offer?.store_name || "Unknown",
    brand: inferBrand(product, product?.offer?.store_name || "Unknown"),
    gender: inferGender(name),
    category: inferCategory(name),
    size: [],
    color: inferColors(name),
    availability: inferAvailability(product),
    material: [],
    rawData: product,
  };
};

export const normalizeCombinedResults = (
  asosResults = [],
  realTimeResults = [],
) => {
  const normalizedAsos = Array.isArray(asosResults)
    ? asosResults.map(normalizeAsosProduct)
    : [];

  const normalizedRealtime = Array.isArray(realTimeResults)
    ? realTimeResults.map(normalizeRealtimeProduct)
    : [];

  return [...normalizedAsos, ...normalizedRealtime];
};

const matchesArrayFilter = (productValue, selectedValues = []) => {
  if (!selectedValues.length) return true;

  if (Array.isArray(productValue)) {
    return productValue.some((value) =>
      selectedValues.includes(normalizeString(value)),
    );
  }

  return selectedValues.includes(normalizeString(productValue));
};

const matchesPriceFilter = (numericPrice, priceMin, priceMax) => {
  if (priceMin === "" && priceMax === "") return true;
  if (numericPrice === null || numericPrice === undefined) return false;

  const min = priceMin !== "" ? Number(priceMin) : null;
  const max = priceMax !== "" ? Number(priceMax) : null;

  if (min !== null && numericPrice < min) return false;
  if (max !== null && numericPrice > max) return false;

  return true;
};

const matchesBrandFilter = (brand, selectedBrands = []) => {
  if (!selectedBrands.length) return true;

  const normalizedBrand = normalizeString(brand);
  if (!normalizedBrand) return false;

  return selectedBrands.some((selectedBrand) => {
    const normalizedSelectedBrand = normalizeString(selectedBrand);
    if (!normalizedSelectedBrand) return false;

    return (
      normalizedBrand.includes(normalizedSelectedBrand) ||
      normalizedSelectedBrand.includes(normalizedBrand)
    );
  });
};

export const applyProductFilters = (products = [], filters = {}) => {
  const normalizedFilters = {
    gender: (filters.gender || []).map(normalizeString),
    category: (filters.category || []).map(normalizeString),
    size: (filters.size || []).map(normalizeString),
    color: (filters.color || []).map(normalizeString),
    brand: (filters.brand || []).map(normalizeString),
    store: (filters.store || []).map(normalizeString),
    availability: (filters.availability || []).map(normalizeString),
    priceMin: filters.priceMin ?? "",
    priceMax: filters.priceMax ?? "",
  };

  return products.filter((product) => {
    const matchesGender = matchesArrayFilter(
      product.gender,
      normalizedFilters.gender,
    );
    const matchesCategory = matchesArrayFilter(
      product.category,
      normalizedFilters.category,
    );
    const matchesSize =
      !normalizedFilters.size.length ||
      (Array.isArray(product.size) && product.size.length > 0
        ? matchesArrayFilter(product.size, normalizedFilters.size)
        : true);
    const matchesColor = matchesArrayFilter(
      product.color,
      normalizedFilters.color,
    );
    const matchesAvailability = matchesArrayFilter(
      product.availability,
      normalizedFilters.availability,
    );
    const matchesStore = matchesArrayFilter(
      product.source,
      normalizedFilters.store,
    );
    const matchesBrand = matchesBrandFilter(
      product.brand,
      normalizedFilters.brand,
    );
    const matchesPrice = matchesPriceFilter(
      product.numericPrice,
      normalizedFilters.priceMin,
      normalizedFilters.priceMax,
    );

    return (
      matchesGender &&
      matchesCategory &&
      matchesSize &&
      matchesColor &&
      matchesAvailability &&
      matchesStore &&
      matchesBrand &&
      matchesPrice
    );
  });
};
