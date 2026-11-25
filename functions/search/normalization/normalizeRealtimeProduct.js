const {parsePriceValue} = require('../../shared/priceUtils');
const {record, text, normalizeProductUrl, normalizeCurrency,
  productIdentity, imageUrl, displayPrice} = require('../../shared/productUtils');
const {inferAvailability, inferBrand, inferCategory, inferColors,
  inferGender} = require('./inferProductAttributes');

const normalizeRealtimeProduct = (product) => {
  if (!record(product)) {
    return null;
  }
  const offer = record(product.offer) ? product.offer : {};
  const name = text(product.product_title) || text(product.productTitle);
  const productUrl = normalizeProductUrl(offer.offer_page_url) ||
    normalizeProductUrl(offer.offerPageUrl);
  if (!name || !productUrl) {
    return null;
  }
  const source = text(offer.store_name, 100) || text(offer.storeName, 100) ||
    new URL(productUrl).hostname;
  const rawPrice = offer.price;
  const numericPrice = parsePriceValue(rawPrice);
  const currency = normalizeCurrency(offer.currency) ||
    normalizeCurrency(offer.currency_code) ||
    normalizeCurrency(product.currency);
  const photos = [
    ...(Array.isArray(product.product_photos) ? product.product_photos : []),
    ...(Array.isArray(product.productPhotos) ? product.productPhotos : []),
  ];
  const providerId = product.product_id ?? product.productId;
  const id = productIdentity('realtime', providerId == null ? null :
    `${source.toLowerCase()}:${providerId}`, productUrl);
  return {
    id, itemId: id, provider: 'realtime', name, title: name,
    price: displayPrice(numericPrice, currency),
    numericPrice, currency, imageUrl: imageUrl(photos), productUrl, source,
    brand: text(inferBrand(product)), gender: inferGender(name),
    category: inferCategory(name), subcategory: '', size: [],
    color: inferColors(name), material: '',
    availability: inferAvailability({...product,
      inStock: typeof offer.inStock === 'boolean' ? offer.inStock : product.inStock,
      availability: offer.availability ?? product.availability}),
  };
};
module.exports = {normalizeRealtimeProduct};
