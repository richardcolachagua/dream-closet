const {normalizeString} = require('../../shared/stringUtils');

const matchesArrayFilter = (productValue, selectedValues = []) => {
  if (!selectedValues.length) {
    return true;
  }

  if (Array.isArray(productValue)) {
    return productValue.some((value) =>
      selectedValues.includes(normalizeString(value)),
    );
  }

  return selectedValues.includes(normalizeString(productValue));
};

const matchesPriceFilter = (numericPrice, priceMin, priceMax) => {
  if (!priceMin && !priceMax) {
    return true;
  }

  if (numericPrice === null || numericPrice === undefined) {
    return false;
  }

  const min = priceMin !== '' ? Number(priceMin) : null;
  const max = priceMax !== '' ? Number(priceMax) : null;

  if (min !== null && numericPrice < min) {
    return false;
  }

  if (max !== null && numericPrice > max) {
    return false;
  }

  return true;
};

const matchesBrandFilter = (brand, selectedBrands = []) => {
  if (!selectedBrands.length) {
    return true;
  }

  const normalizedBrand = normalizeString(brand);

  return selectedBrands.some((selectedBrand) => {
    const normalizedSelectedBrand = normalizeString(selectedBrand);

    return (
      normalizedBrand.includes(normalizedSelectedBrand) ||
      normalizedSelectedBrand.includes(normalizedBrand)
    );
  });
};

const normalizeFilters = (filters = {}) => ({
  gender: (filters.gender || []).map(normalizeString),
  category: (filters.category || []).map(normalizeString),
  size: (filters.size || []).map(normalizeString),
  color: (filters.color || []).map(normalizeString),
  brand: (filters.brand || []).map(normalizeString),
  store: (filters.store || []).map(normalizeString),
  availability: (filters.availability || []).map(normalizeString),
  priceMin: filters.priceMin ?? '',
  priceMax: filters.priceMax ?? '',
});

const applyProductFilters = (products = [], filters = {}) => {
  const normalizedFilters = normalizeFilters(filters);

  return products.filter((product) => {
    const matchesSize =
      !normalizedFilters.size.length ||
      !Array.isArray(product.size) ||
      !product.size.length ||
      matchesArrayFilter(product.size, normalizedFilters.size);

    return (
      matchesArrayFilter(product.gender, normalizedFilters.gender) &&
      matchesArrayFilter(product.category, normalizedFilters.category) &&
      matchesSize &&
      matchesArrayFilter(product.color, normalizedFilters.color) &&
      matchesArrayFilter(
          product.availability,
          normalizedFilters.availability,
      ) &&
      matchesArrayFilter(product.source, normalizedFilters.store) &&
      matchesBrandFilter(product.brand, normalizedFilters.brand) &&
      matchesPriceFilter(
          product.numericPrice,
          normalizedFilters.priceMin,
          normalizedFilters.priceMax,
      )
    );
  });
};

module.exports = {
  applyProductFilters,
};
