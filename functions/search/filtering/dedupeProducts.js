const {normalizeString} = require('../../shared/stringUtils');

const dedupeProducts = (products = []) => {
  const seen = new Set();

  return products.filter((product) => {
    const key =
      normalizeString(product.itemId) ||
      normalizeString(product.productUrl) ||
      `${normalizeString(product.source)}::${normalizeString(product.name)}`;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

module.exports = {
  dedupeProducts,
};
