const {parsePriceValue} = require('../../shared/priceUtils');
const {
  inferAvailability,
  inferBrand,
  inferCategory,
  inferColors,
  inferGender,
} = require('./inferProductAttributes');

const normalizeAsosProduct = (product = {}) => {
  const name = product.name || '';

  const numericPrice =
    product.price?.current?.value ||
    parsePriceValue(product.price?.current?.text);

  return {
    itemId: product.id || null,
    name,
    title: name,
    price: product.price?.current?.text || 'Price unavailable',
    numericPrice,
    currency: 'USD',
    imageUrl: product.imageUrl ? `https://${product.imageUrl}` : '',
    productUrl: product.url ? `https://www.asos.com${product.url}` : '',
    source: 'ASOS',
    brand: inferBrand(product, 'ASOS'),
    gender: inferGender(name),
    category: inferCategory(name),
    subcategory: '',
    size: [],
    color: inferColors(name),
    material: '',
    availability: inferAvailability(product),
    rawData: product,
  };
};

module.exports = {
  normalizeAsosProduct,
};
