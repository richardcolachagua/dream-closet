const test = require('node:test');
const assert = require('node:assert/strict');
const {parsePriceValue} = require('../../functions/shared/priceUtils');
const {includesKeyword} = require('../../functions/shared/stringUtils');
const {normalizeProductUrl, normalizeCurrency} =
  require('../../functions/shared/productUtils');
const {normalizeAsosProduct: asos} =
  require('../../functions/search/normalization/normalizeAsosProduct');
const {normalizeRealtimeProduct: realtime} =
  require('../../functions/search/normalization/normalizeRealtimeProduct');
const {normalizeCombinedResults} =
  require('../../functions/search/normalization/normalizeProducts');
const {inferAvailability, inferGender, inferCategory} =
  require('../../functions/search/normalization/inferProductAttributes');
const {dedupeProducts} = require('../../functions/search/filtering/dedupeProducts');
const {applyProductFilters} =
  require('../../functions/search/filtering/applyProductFilters');
const {sortProducts} = require('../../functions/search/filtering/sortProducts');
const a = (extra = {}) => ({id: 1, name: "Women's blue shirt",
  url: '/product/1', price: {current: {value: 0}}, ...extra});
const r = (extra = {}) => ({product_id: '1', product_title: 'Blue shirt',
  offer: {price: 20, currency: 'EUR', store_name: 'Shop',
    offer_page_url: 'https://shop.example/product/1'}, ...extra});

test('zero remains a valid numeric price', () => {
  assert.equal(parsePriceValue(0), 0);
  assert.equal(parsePriceValue('$0.00'), 0);
  assert.equal(asos(a()).numericPrice, 0);
});
test('rejects nonfinite and negative prices', () => {
  for (const x of [NaN, Infinity, -1, '-12', {}, [], true]) {
    assert.equal(parsePriceValue(x), null);
  }
});
test('parses explicit dot-decimal grouping', () => {
  assert.equal(parsePriceValue('USD 1,234.56'), 1234.56);
});
test('comma decimal parsing requires explicit context', () => {
  assert.equal(parsePriceValue('€1.234,56', {decimalSeparator: ','}), 1234.56);
  assert.equal(parsePriceValue('€1.234,56'), null);
  assert.equal(parsePriceValue('12,50'), null);
});
test('ranges and prose do not masquerade as exact prices', () => {
  for (const x of ['$10 - $20', 'from $10', '2 for $10', '', 'free']) {
    assert.equal(parsePriceValue(x), null);
  }
});
test('URL handling supports known bases and rejects unsafe input', () => {
  assert.equal(normalizeProductUrl('/p', 'https://shop.example'),
      'https://shop.example/p');
  assert.equal(normalizeProductUrl('//images.example/p'), 'https://images.example/p');
  for (const x of ['javascript:alert(1)', 'data:image/png,x',
    'https://user:pass@shop.example/p', 'https://shop.example/a b']) {
    assert.equal(normalizeProductUrl(x), '');
  }
});
test('currency codes must be recognized', () => {
  assert.equal(normalizeCurrency('eur'), 'EUR');
  assert.equal(normalizeCurrency('ZZZ'), null);
  assert.equal(normalizeCurrency('$'), null);
});
test('absolute ASOS URLs are not double-prefixed', () => {
  const item = asos(a({url: 'https://www.asos.com/p',
    imageUrl: 'https://images.asos-media.com/p'}));
  assert.equal(item.productUrl, 'https://www.asos.com/p');
  assert.equal(item.imageUrl, 'https://images.asos-media.com/p');
});
test('schemeless ASOS image hosts are normalized', () => {
  assert.equal(asos(a({imageUrl: 'images.asos-media.com/p'})).imageUrl,
      'https://images.asos-media.com/p');
});
test('ASOS currency uses explicit metadata before US adapter fallback', () => {
  assert.equal(asos(a()).currency, 'USD');
  assert.equal(asos(a({price: {currency: 'GBP', current: {value: 10}}})).currency,
      'GBP');
});
test('malformed records are safely omitted', () => {
  for (const x of [null, undefined, 2, [], {}, {name: 'x'}]) {
    assert.equal(asos(x), null);
    assert.equal(realtime(x), null);
  }
  assert.equal(normalizeCombinedResults([null, a()], [false, r()]).length, 2);
});
test('public product shape excludes raw records', () => {
  for (const item of [asos(a()), realtime(r())]) {
    assert.ok(item.id);
    assert.equal(item.itemId, item.id);
    assert.ok(!('rawData' in item));
    assert.equal(item.brand, '');
    assert.doesNotThrow(() => JSON.stringify(item));
  }
});
test('offer and photo shapes are validated', () => {
  assert.equal(realtime(r({offer: []})), null);
  assert.equal(realtime(r({product_photos: 'https://images.example/p'})).imageUrl, '');
  assert.equal(realtime(r({product_photos: [null, 'javascript:x',
    'https://images.example/p']})).imageUrl, 'https://images.example/p');
});
test('retailer remains source and provider is separate', () => {
  const item = realtime(r());
  assert.equal(item.source, 'Shop');
  assert.equal(item.provider, 'realtime');
});
test('unknown marketplace currency is not USD', () => {
  const item = realtime(r({offer: {price: '$20',
    offer_page_url: 'https://shop.example/p'}}));
  assert.equal(item.currency, null);
  assert.equal(item.source, 'shop.example');
  assert.ok(item.price.includes('currency unconfirmed'));
});
test('formatted price text preserves known currency for existing save schema', () => {
  assert.ok(realtime(r()).price.includes('€'));
  assert.ok(asos(a()).price.includes('$'));
});
test('negative availability wins over positive substring', () => {
  for (const value of ['unavailable', 'not available', 'out of stock',
    'sold out', 'not in stock']) {
    assert.equal(inferAvailability({availability: value}), 'outofstock');
  }
  assert.equal(inferAvailability({availability: 'available'}), 'instock');
  assert.equal(inferAvailability(null), 'unknown');
});
test('boolean inventory takes precedence', () => {
  assert.equal(inferAvailability({inStock: false, availability: 'available'}),
      'outofstock');
});
test('keyword matching respects tokens and possessives', () => {
  assert.equal(includesKeyword('woman', ['man']), false);
  assert.equal(includesKeyword('female', ['male']), false);
  assert.equal(includesKeyword('redwood', ['red']), false);
  assert.equal(inferGender("Women's shirt"), 'female');
});
test('regular plurals retain useful category matching', () => {
  assert.equal(inferCategory('leather boots'), 'shoes');
  assert.equal(includesKeyword('dresses', ['dress']), true);
});
test('different providers do not collide on the same raw ID', () => {
  assert.equal(dedupeProducts([asos(a()), realtime(r())]).length, 2);
});
test('same normalized identity deduplicates predictably', () => {
  assert.equal(dedupeProducts([asos(a()), asos(a())]).length, 1);
});
test('same marketplace ID at different retailers is distinct', () => {
  const second = r(); second.offer.store_name = 'Other';
  assert.notEqual(realtime(r()).id, realtime(second).id);
});
test('zero maximum and unknown brand filters work', () => {
  const items = [asos(a()), realtime(r())];
  assert.equal(applyProductFilters(items, {priceMax: 0}).length, 1);
  assert.equal(applyProductFilters(items, {brand: ['nike']}).length, 0);
});
test('sort groups currencies, sorts within them, and retains unknown order', () => {
  const items = [{numericPrice: 30, currency: 'USD'},
    {numericPrice: 10, currency: 'USD'}, {numericPrice: 20, currency: 'EUR'},
    {numericPrice: 1, currency: null}, {numericPrice: null, currency: 'USD'}];
  const sorted = sortProducts(items, 'price_asc');
  assert.deepEqual(sorted.map((x) => x.numericPrice), [20, 10, 30, 1, null]);
  assert.deepEqual(sortProducts(items, 'relevance'), items);
});
test('real normalization/filter/dedupe/sort pipeline retains zero-price product', () => {
  const normalized = normalizeCombinedResults([a(), a()], [r()]);
  const items = sortProducts(applyProductFilters(dedupeProducts(normalized),
      {priceMax: 0}), 'price_asc');
  assert.equal(items.length, 1);
  assert.equal(items[0].numericPrice, 0);
});
