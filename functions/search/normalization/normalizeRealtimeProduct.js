const {parsePriceValue} = require('../../shared/priceUtils');
const {
  inferAvailability,
  inferBrand,
  inferCategory,
  inferColors,
  inferGender,
} = require('./inferProductAttributes');

const normalizeRealtimeProduct = (product = {}) => {
  const name = product.product_title || product.productTitle || '';
  const rawPrice = product.offer?.price || 'Price unavailable';

  const source =
    product.offer?.store_name || product.offer?.storeName || 'Unknown';

  return {
    itemId: product.product_id || product.productId || null,
    name,
    title: name,
    price: rawPrice,
    numericPrice: parsePriceValue(rawPrice),
    currency: 'USD',
    imageUrl: product.product_photos?.[0] || product.productPhotos?.[0] || '',
    productUrl:
      product.offer?.offer_page_url || product.offer?.offerPageUrl || '',
    source,
    brand: inferBrand(product, source),
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
  normalizeRealtimeProduct,
};
