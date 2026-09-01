const CATEGORY_KEYWORDS = require('../constants/categoryKeywords');
const COLOR_KEYWORDS = require('../constants/colorKeywords');
const GENDER_KEYWORDS = require('../constants/genderKeywords');
const {
  normalizeString,
  includesKeyword,
} = require('../../shared/stringUtils');

const inferCategory = (productName = '') => {
  const normalizedName = normalizeString(productName);

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) {
      return category;
    }
  }

  return 'unknown';
};

const inferColors = (productName = '') => {
  const normalizedName = normalizeString(productName);

  return Object.entries(COLOR_KEYWORDS)
      .filter(([, keywords]) => includesKeyword(normalizedName, keywords))
      .map(([color]) => color);
};

const inferGender = (productName = '') => {
  const normalizedName = normalizeString(productName);

  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (includesKeyword(normalizedName, keywords)) {
      return gender;
    }
  }

  return 'unknown';
};

const inferAvailability = (product = {}) => {
  if (typeof product.inStock === 'boolean') {
    return product.inStock ? 'instock' : 'outofstock';
  }

  const availability = normalizeString(product.availability);

  if (availability.includes('in stock') || availability.includes('available')) {
    return 'instock';
  }

  if (
    availability.includes('out of stock') ||
    availability.includes('unavailable') ||
    availability.includes('sold out')
  ) {
    return 'outofstock';
  }

  return 'unknown';
};

const inferBrand = (product = {}, fallbackSource = 'Unknown') =>
  product.brandName ||
  product.brand ||
  product.offer?.store_name ||
  product.offer?.storeName ||
  fallbackSource;

module.exports = {
  inferCategory,
  inferColors,
  inferGender,
  inferAvailability,
  inferBrand,
};
