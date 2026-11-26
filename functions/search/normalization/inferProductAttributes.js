const CATEGORY_KEYWORDS = require('../constants/categoryKeywords');
const COLOR_KEYWORDS = require('../constants/colorKeywords');
const GENDER_KEYWORDS = require('../constants/genderKeywords');
const {
  normalizeString,
  includesKeyword,
} = require('../../shared/stringUtils');

const PRIORITY_CATEGORIES = ['shoes'];

const stripFalseFootwear = (name) =>
  String(name).replace(/\bboot[\s-]?cut\b/gi, ' ');

const inferCategory = (name = '') => {
  const input = stripFalseFootwear(name);
  const entries = Object.entries(CATEGORY_KEYWORDS);
  const ordered = [
    ...entries.filter(([category]) => PRIORITY_CATEGORIES.includes(category)),
    ...entries.filter(([category]) => !PRIORITY_CATEGORIES.includes(category)),
  ];
  for (const [category, keywords] of ordered) {
    if (includesKeyword(input, keywords)) {
      return category;
    }
  }
  return 'unknown';
};

const inferColors = (name = '') =>
  Object.entries(COLOR_KEYWORDS)
      .filter(([, keywords]) => includesKeyword(name, keywords))
      .map(([color]) => color);
const inferGender = (name = '') => {
  const matches = Object.entries(GENDER_KEYWORDS)
      .filter(([, keywords]) => includesKeyword(name, keywords))
      .map(([gender]) => gender);
  if (matches.includes('unisex')) {
    return 'unisex';
  }
  return matches.length === 1 ? matches[0] : 'unknown';
};
const inferAvailability = (value = {}) => {
  const product =
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  if (typeof product.inStock === 'boolean') {
    return product.inStock ? 'instock' : 'outofstock';
  }
  const availability = normalizeString(product.availability);
  if (
    includesKeyword(availability, [
      'out of stock',
      'outofstock',
      'unavailable',
      'sold out',
      'not available',
      'not in stock',
    ])
  ) {
    return 'outofstock';
  }
  if (includesKeyword(availability, ['not', 'no', 'unknown'])) {
    return 'unknown';
  }
  if (includesKeyword(availability, ['in stock', 'instock', 'available'])) {
    return 'instock';
  }
  return 'unknown';
};
const inferBrand = (product = {}) => {
  for (const value of [product?.brandName, product?.brand]) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};
module.exports = {
  inferCategory,
  inferColors,
  inferGender,
  inferAvailability,
  inferBrand,
};
