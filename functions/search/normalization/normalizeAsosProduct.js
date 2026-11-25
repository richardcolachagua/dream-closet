const {parsePriceValue} = require('../../shared/priceUtils');
const {record, text, normalizeProductUrl, normalizeCurrency,
  productIdentity, imageUrl, displayPrice} = require('../../shared/productUtils');
const {inferAvailability, inferBrand, inferCategory, inferColors,
  inferGender} = require('./inferProductAttributes');

const normalizeAsosProduct = (product) => {
  if (!record(product)) {
    return null;
  }
  const name = text(product.name);
  const productUrl = normalizeProductUrl(product.url, 'https://www.asos.com/');
  if (!name || !productUrl) {
    return null;
  }
  const current = record(product.price?.current) ? product.price.current : {};
  const numericPrice = parsePriceValue(current.value) ??
    parsePriceValue(current.text);
  const currency = normalizeCurrency(product.price?.currency) ||
    normalizeCurrency(current.currency) || 'USD';
  const id = productIdentity('asos', product.id, productUrl);
  const candidateImage = text(product.imageUrl);
  const images = candidateImage && !/^[a-z][a-z\d+.-]*:/i.test(candidateImage) &&
    !candidateImage.startsWith('/') ? [`https://${candidateImage}`] :
    [candidateImage];
  return {
    id, itemId: id, provider: 'asos', name, title: name,
    price: displayPrice(numericPrice, currency),
    numericPrice, currency,
    imageUrl: imageUrl(images, 'https://www.asos.com/'), productUrl,
    source: 'ASOS', brand: text(inferBrand(product)),
    gender: inferGender(name), category: inferCategory(name),
    subcategory: '', size: [], color: inferColors(name), material: '',
    availability: inferAvailability(product),
  };
};
module.exports = {normalizeAsosProduct};
