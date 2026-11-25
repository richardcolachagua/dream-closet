const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizeRealtimeProduct: normalize} = require(
    '../../functions/search/normalization/normalizeRealtimeProduct');

// Synthetic values matching the observed top-level field layout, not a raw response.
const listing = (extra = {}) => ({
  product_id: 'listing-1',
  product_title: 'Blue linen shirt',
  price: '$29.00',
  product_page_url: 'https://retailer.example/products/linen-shirt',
  product_photos: ['https://images.example/linen-shirt.jpg'],
  store_name: 'Example Retailer',
  ...extra,
});

test('flat search-v2 listing normalizes without an offer object', () => {
  const item = normalize(listing());
  assert.ok(item);
  assert.equal(item.productUrl, 'https://retailer.example/products/linen-shirt');
  assert.equal(item.source, 'Example Retailer');
  assert.equal(item.numericPrice, 29);
  assert.equal(item.imageUrl, 'https://images.example/linen-shirt.jpg');
  assert.equal(item.provider, 'realtime');
  assert.ok(!('rawData' in item));
});

test('flat listing currency is unknown unless explicit', () => {
  const item = normalize(listing());
  assert.equal(item.currency, null);
  assert.ok(item.price.includes('currency unconfirmed'));
  assert.equal(normalize(listing({currency: 'EUR'})).currency, 'EUR');
});

test('flat zero price survives', () => {
  assert.equal(normalize(listing({price: 0})).numericPrice, 0);
});

test('nested offer remains supported without mixing flat listing values', () => {
  const item = normalize(listing({offer: {
    offer_page_url: 'https://other.example/item/1',
    store_name: 'Other Retailer',
    price: '12.50',
    currency: 'GBP',
  }}));
  assert.equal(item.productUrl, 'https://other.example/item/1');
  assert.equal(item.source, 'Other Retailer');
  assert.equal(item.numericPrice, 12.5);
  assert.equal(item.currency, 'GBP');
});

test('invalid nested offer falls back to a usable flat listing', () => {
  const item = normalize(listing({offer: {offer_page_url: 'javascript:alert(1)'}}));
  assert.equal(item.source, 'Example Retailer');
  assert.equal(item.numericPrice, 29);
});

test('unsafe or missing product links remain rejected', () => {
  assert.equal(normalize(listing({product_page_url: 'javascript:alert(1)'})), null);
  assert.equal(normalize(listing({product_page_url: ''})), null);
});

test('unknown price and missing image do not discard a usable listing', () => {
  const item = normalize(listing({price: {unexpected: true}, product_photos: null}));
  assert.ok(item);
  assert.equal(item.numericPrice, null);
  assert.equal(item.imageUrl, '');
});

test('malformed product IDs use URL identity instead of object coercion', () => {
  const first = normalize(listing({product_id: {bad: 1}}));
  const second = normalize(listing({product_id: {bad: 2},
    product_page_url: 'https://retailer.example/products/other'}));
  assert.notEqual(first.id, second.id);
});
