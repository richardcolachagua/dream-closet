const {normalizeString} = require('../../shared/stringUtils');

const matchesArrayFilter = (productValue, selected = []) => {
  if (!selected.length) {
    return true;
  }
  return Array.isArray(productValue) ? productValue.some((value) =>
    selected.includes(normalizeString(value))) :
    selected.includes(normalizeString(productValue));
};
const matchesPriceFilter = (price, min, max) => {
  const hasMin = min !== '' && min != null;
  const hasMax = max !== '' && max != null;
  if (!hasMin && !hasMax) {
    return true;
  }
  if (!Number.isFinite(price) || price < 0) {
    return false;
  }
  return (!hasMin || price >= Number(min)) &&
    (!hasMax || price <= Number(max));
};
const matchesBrandFilter = (brand, selected = []) => {
  if (!selected.length) {
    return true;
  }
  const value = normalizeString(brand);
  if (!value) {
    return false;
  }
  return selected.some((candidate) => {
    const expected = normalizeString(candidate);
    return Boolean(expected) &&
      (value.includes(expected) || expected.includes(value));
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
  priceMin: filters.priceMin ?? '', priceMax: filters.priceMax ?? '',
});
const applyProductFilters = (products = [], filters = {}) => {
  const selected = normalizeFilters(filters);
  return products.filter((product) => {
    const matchesSize = !selected.size.length ||
      !Array.isArray(product.size) || !product.size.length ||
      matchesArrayFilter(product.size, selected.size);
    return matchesArrayFilter(product.gender, selected.gender) &&
      matchesArrayFilter(product.category, selected.category) && matchesSize &&
      matchesArrayFilter(product.color, selected.color) &&
      matchesArrayFilter(product.availability, selected.availability) &&
      matchesArrayFilter(product.source, selected.store) &&
      matchesBrandFilter(product.brand, selected.brand) &&
      matchesPriceFilter(product.numericPrice, selected.priceMin, selected.priceMax);
  });
};
module.exports = {applyProductFilters};
