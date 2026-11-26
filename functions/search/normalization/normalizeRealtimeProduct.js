const {parsePriceValue} = require('../../shared/priceUtils');
const {
  record,
  text,
  normalizeProductUrl,
  normalizeCurrency,
  productIdentity,
  imageUrl,
  displayPrice,
} = require('../../shared/productUtils');
const {
  inferAvailability,
  inferBrand,
  inferCategory,
  inferColors,
  inferGender,
} = require('./inferProductAttributes');

const isMarketplaceUrl = (url) => {
  try {
    return /(^|\.)google\.[a-z.]+$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

const normalizeRealtimeProduct = (product) => {
  if (!record(product)) {
    return null;
  }

  const name = text(product.product_title) || text(product.productTitle);
  const offer = record(product.offer) ? product.offer : {};
  const offerUrl =
    normalizeProductUrl(offer.offer_page_url) ||
    normalizeProductUrl(offer.offerPageUrl);
  const listingUrl =
    normalizeProductUrl(product.product_page_url) ||
    normalizeProductUrl(product.productPageUrl);
  const productUrl = offerUrl || listingUrl;

  if (!name || !productUrl) {
    return null;
  }

  // Keep price and retailer tied to the selected offer/listing URL.
  const selected = offerUrl ? offer : product;
  const source =
    text(selected.store_name, 100) ||
    text(selected.storeName, 100) ||
    new URL(productUrl).hostname;
  const numericPrice = parsePriceValue(selected.price);
  const explicitCurrency =
    normalizeCurrency(selected.currency) ||
    normalizeCurrency(selected.currency_code);
  const currency = explicitCurrency || (numericPrice === null ? null : 'USD');
  const currencyBasis = explicitCurrency ?
    'provider' :
    currency ?
      'assumed-us-market' :
      'unknown';
  const photos = [
    ...(Array.isArray(product.product_photos) ? product.product_photos : []),
    ...(Array.isArray(product.productPhotos) ? product.productPhotos : []),
  ];

  const rawId = product.product_id ?? product.productId;
  const providerId =
    typeof rawId === 'string' ?
      text(rawId, 400) :
      typeof rawId === 'number' && Number.isFinite(rawId) ?
        String(rawId) :
        '';
  const id = productIdentity(
      'realtime',
    providerId ? `${source.toLowerCase()}:${providerId}` : null,
    productUrl,
  );

  return {
    id,
    itemId: id,
    provider: 'realtime',
    name,
    title: name,
    price: displayPrice(numericPrice, currency),
    numericPrice,
    currency,
    currencyBasis,
    linkType: isMarketplaceUrl(productUrl) ? 'marketplace' : 'retailer',
    imageUrl: imageUrl(photos),
    productUrl,
    source,
    brand: text(inferBrand(product)),
    gender: inferGender(name),
    category: inferCategory(name),
    subcategory: '',
    size: [],
    color: inferColors(name),
    material: '',
    availability: inferAvailability(selected),
  };
};

module.exports = {normalizeRealtimeProduct};
