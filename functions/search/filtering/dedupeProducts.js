const {record, text} = require('../../shared/productUtils');
const dedupeProducts = (products = []) => {
  const seen = new Set();
  return (Array.isArray(products) ? products : []).filter((product) => {
    if (!record(product)) {
      return false;
    }
    const source = text(product.source).toLowerCase();
    const provider = text(product.provider).toLowerCase() || source;
    const id = product.itemId == null ? '' : String(product.itemId);
    const key = text(product.id) || (product.productUrl ?
      `url:${source}:${product.productUrl}` : id ? `${provider}:${id}` : '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
module.exports = {dedupeProducts};
