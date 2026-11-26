#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const replacements = {
  "functions/shared/priceUtils.js":
    "const parsePriceValue = (value, {decimalSeparator = '.'} = {}) => {\n  if (typeof value === 'number') {\n    return Number.isFinite(value) && value >= 0 ? value : null;\n  }\n  if (typeof value !== 'string' || !['.', ','].includes(decimalSeparator)) {\n    return null;\n  }\n  let text = value.trim().replace(/\\u00a0|\\u202f/g, ' ');\n  text = text.replace(/^(?:[A-Z]{3}\\s*|[$€£¥]\\s*)/, '')\n      .replace(/(?:\\s*[A-Z]{3}|\\s*[$€£¥])$/, '').trim();\n  const pattern = decimalSeparator === '.' ?\n    /^(?:\\d+|\\d{1,3}(?:,\\d{3})+)(?:\\.\\d{1,2})?$/ :\n    /^(?:\\d+|\\d{1,3}(?:\\.\\d{3})+)(?:,\\d{1,2})?$/;\n  if (!pattern.test(text)) {\n    return null;\n  }\n  text = decimalSeparator === '.' ? text.replace(/,/g, '') :\n    text.replace(/\\./g, '').replace(',', '.');\n  const number = Number(text);\n  return Number.isFinite(number) && number >= 0 ? number : null;\n};\n\nmodule.exports = {parsePriceValue};\n",
  "functions/shared/stringUtils.js":
    "const normalizeString = (value) => {\n  if (typeof value !== 'string' && typeof value !== 'number') {\n    return '';\n  }\n  return String(value).normalize('NFKC').trim().toLowerCase();\n};\n\nconst words = (value) => normalizeString(value)\n    .replace(/['’]/gu, '').match(/[\\p{L}\\p{N}]+/gu) || [];\n\nconst includesKeyword = (text, keywords = []) => {\n  const tokens = words(text);\n  if (!Array.isArray(keywords)) {\n    return false;\n  }\n  return keywords.some((keyword) => {\n    const expected = words(keyword);\n    return expected.length > 0 && tokens.some((_, start) =>\n      expected.every((token, offset) => {\n        const actual = tokens[start + offset];\n        const plural = /(?:s|x|z|ch|sh)$/.test(token) ? `${token}es` : `${token}s`;\n        return actual === token ||\n          (offset === expected.length - 1 && actual === plural);\n      }));\n  });\n};\n\nmodule.exports = {normalizeString, includesKeyword};\n",
  "functions/shared/productUtils.js":
    "const {createHash} = require('node:crypto');\n\nconst record = (value) => Boolean(value && typeof value === 'object' &&\n  !Array.isArray(value));\nconst text = (value, limit = 300) => typeof value === 'string' ?\n  value.trim().slice(0, limit) : '';\nconst normalizeProductUrl = (value, base) => {\n  const input = text(value, 4097);\n  if (!input || input.length > 4096 || /[\\s\\\\\\u0000-\\u001f]/u.test(input)) {\n    return '';\n  }\n  try {\n    const url = new URL(input.startsWith('//') ? `https:${input}` : input, base);\n    if (!['https:', 'http:'].includes(url.protocol) ||\n        url.username || url.password) {\n      return '';\n    }\n    return url.href;\n  } catch {\n    return '';\n  }\n};\nconst currencies = new Set(Intl.supportedValuesOf('currency'));\nconst normalizeCurrency = (value) => {\n  const code = text(value, 4).toUpperCase();\n  return currencies.has(code) ? code : null;\n};\nconst productIdentity = (provider, sourceId, productUrl) => {\n  const id = typeof sourceId === 'number' && Number.isFinite(sourceId) ?\n    String(sourceId) : text(sourceId, 512);\n  return `${provider}:${createHash('sha256')\n      .update(id ? `id:${id}` : `url:${productUrl}`).digest('hex')}`;\n};\nconst imageUrl = (values, base) => {\n  if (!Array.isArray(values)) {\n    return '';\n  }\n  for (const value of values) {\n    const result = normalizeProductUrl(value, base);\n    if (result) {\n      return result;\n    }\n  }\n  return '';\n};\nconst displayPrice = (amount, currency) => {\n  if (amount === null) {\n    return 'Price unavailable';\n  }\n  if (currency) {\n    try {\n      return new Intl.NumberFormat('en-US', {style: 'currency', currency})\n          .format(amount);\n    } catch {\n      // Unknown currency codes must not imply dollars.\n    }\n  }\n  return `${amount} (currency unconfirmed)`;\n};\nmodule.exports = {record, text, normalizeProductUrl, normalizeCurrency,\n  displayPrice,\n  productIdentity, imageUrl};\n",
  "functions/search/normalization/normalizeAsosProduct.js":
    "const {parsePriceValue} = require('../../shared/priceUtils');\nconst {record, text, normalizeProductUrl, normalizeCurrency,\n  productIdentity, imageUrl, displayPrice} = require('../../shared/productUtils');\nconst {inferAvailability, inferBrand, inferCategory, inferColors,\n  inferGender} = require('./inferProductAttributes');\n\nconst normalizeAsosProduct = (product) => {\n  if (!record(product)) {\n    return null;\n  }\n  const name = text(product.name);\n  const productUrl = normalizeProductUrl(product.url, 'https://www.asos.com/');\n  if (!name || !productUrl) {\n    return null;\n  }\n  const current = record(product.price?.current) ? product.price.current : {};\n  const numericPrice = parsePriceValue(current.value) ??\n    parsePriceValue(current.text);\n  const currency = normalizeCurrency(product.price?.currency) ||\n    normalizeCurrency(current.currency) || 'USD';\n  const id = productIdentity('asos', product.id, productUrl);\n  const candidateImage = text(product.imageUrl);\n  const images = candidateImage && !/^[a-z][a-z\\d+.-]*:/i.test(candidateImage) &&\n    !candidateImage.startsWith('/') ? [`https://${candidateImage}`] :\n    [candidateImage];\n  return {\n    id, itemId: id, provider: 'asos', name, title: name,\n    price: displayPrice(numericPrice, currency),\n    numericPrice, currency,\n    imageUrl: imageUrl(images, 'https://www.asos.com/'), productUrl,\n    source: 'ASOS', brand: text(inferBrand(product)),\n    gender: inferGender(name), category: inferCategory(name),\n    subcategory: '', size: [], color: inferColors(name), material: '',\n    availability: inferAvailability(product),\n  };\n};\nmodule.exports = {normalizeAsosProduct};\n",
  "functions/search/normalization/normalizeRealtimeProduct.js":
    "const {parsePriceValue} = require('../../shared/priceUtils');\nconst {record, text, normalizeProductUrl, normalizeCurrency,\n  productIdentity, imageUrl, displayPrice} = require('../../shared/productUtils');\nconst {inferAvailability, inferBrand, inferCategory, inferColors,\n  inferGender} = require('./inferProductAttributes');\n\nconst normalizeRealtimeProduct = (product) => {\n  if (!record(product)) {\n    return null;\n  }\n  const offer = record(product.offer) ? product.offer : {};\n  const name = text(product.product_title) || text(product.productTitle);\n  const productUrl = normalizeProductUrl(offer.offer_page_url) ||\n    normalizeProductUrl(offer.offerPageUrl);\n  if (!name || !productUrl) {\n    return null;\n  }\n  const source = text(offer.store_name, 100) || text(offer.storeName, 100) ||\n    new URL(productUrl).hostname;\n  const rawPrice = offer.price;\n  const numericPrice = parsePriceValue(rawPrice);\n  const currency = normalizeCurrency(offer.currency) ||\n    normalizeCurrency(offer.currency_code) ||\n    normalizeCurrency(product.currency);\n  const photos = [\n    ...(Array.isArray(product.product_photos) ? product.product_photos : []),\n    ...(Array.isArray(product.productPhotos) ? product.productPhotos : []),\n  ];\n  const providerId = product.product_id ?? product.productId;\n  const id = productIdentity('realtime', providerId == null ? null :\n    `${source.toLowerCase()}:${providerId}`, productUrl);\n  return {\n    id, itemId: id, provider: 'realtime', name, title: name,\n    price: displayPrice(numericPrice, currency),\n    numericPrice, currency, imageUrl: imageUrl(photos), productUrl, source,\n    brand: text(inferBrand(product)), gender: inferGender(name),\n    category: inferCategory(name), subcategory: '', size: [],\n    color: inferColors(name), material: '',\n    availability: inferAvailability({...product,\n      inStock: typeof offer.inStock === 'boolean' ? offer.inStock : product.inStock,\n      availability: offer.availability ?? product.availability}),\n  };\n};\nmodule.exports = {normalizeRealtimeProduct};\n",
  "functions/search/normalization/normalizeProducts.js":
    "const {normalizeAsosProduct} = require('./normalizeAsosProduct');\nconst {normalizeRealtimeProduct} = require('./normalizeRealtimeProduct');\n\nconst normalizeCombinedResults = (asosResults = [], realTimeResults = []) => [\n  ...(Array.isArray(asosResults) ? asosResults : []).map(normalizeAsosProduct),\n  ...(Array.isArray(realTimeResults) ? realTimeResults : [])\n      .map(normalizeRealtimeProduct),\n].filter(Boolean);\n\nmodule.exports = {normalizeCombinedResults};\n",
  "functions/search/filtering/dedupeProducts.js":
    "const {record, text} = require('../../shared/productUtils');\nconst dedupeProducts = (products = []) => {\n  const seen = new Set();\n  return (Array.isArray(products) ? products : []).filter((product) => {\n    if (!record(product)) {\n      return false;\n    }\n    const source = text(product.source).toLowerCase();\n    const provider = text(product.provider).toLowerCase() || source;\n    const id = product.itemId == null ? '' : String(product.itemId);\n    const key = text(product.id) || (product.productUrl ?\n      `url:${source}:${product.productUrl}` : id ? `${provider}:${id}` : '');\n    if (!key || seen.has(key)) {\n      return false;\n    }\n    seen.add(key);\n    return true;\n  });\n};\nmodule.exports = {dedupeProducts};\n",
  "functions/search/filtering/sortProducts.js":
    "const sortProducts = (products = [], sort = 'relevance') => {\n  const sorted = [...products];\n  if (!['price_asc', 'price_desc'].includes(sort)) {\n    return sorted;\n  }\n  return sorted.sort((a, b) => {\n    const validA = Number.isFinite(a.numericPrice) && a.numericPrice >= 0;\n    const validB = Number.isFinite(b.numericPrice) && b.numericPrice >= 0;\n    if (validA !== validB) {\n      return validA ? -1 : 1;\n    }\n    if (!validA) {\n      return 0;\n    }\n    const currencyA = a.currency || '';\n    const currencyB = b.currency || '';\n    if (currencyA !== currencyB) {\n      if (!currencyA || !currencyB) {\n        return currencyA ? -1 : 1;\n      }\n      return currencyA < currencyB ? -1 : 1;\n    }\n    if (!currencyA) {\n      return 0;\n    }\n    return (sort === 'price_asc' ? 1 : -1) * (a.numericPrice - b.numericPrice);\n  });\n};\nmodule.exports = {sortProducts};\n",
  "src/features/search/utils/formatProductPrice.js":
    'export const formatProductPrice = (result = {}) => {\n  const value = result.numericPrice;\n  if (Number.isFinite(value) && value >= 0) {\n    if (/^[A-Z]{3}$/.test(result.currency || "")) {\n      try {\n        return new Intl.NumberFormat("en-US", {\n          style: "currency", currency: result.currency,\n        }).format(value);\n      } catch {\n        // Preserve the amount without inventing a currency.\n      }\n    }\n    return `${value.toLocaleString("en-US")} (currency unconfirmed)`;\n  }\n  return typeof result.price === "string" && result.price.trim()\n    ? result.price : "Price unavailable";\n};\n',
  "src/features/search/utils/formatProductPrice.test.js":
    'import { formatProductPrice } from "./formatProductPrice";\n\ntest("formats zero with its verified currency", () => {\n  expect(formatProductPrice({ numericPrice: 0, currency: "USD" })).toBe("$0.00");\n});\ntest("does not invent USD for an unknown currency", () => {\n  expect(formatProductPrice({ numericPrice: 25, currency: null }))\n    .toBe("25 (currency unconfirmed)");\n});\ntest("formats EUR separately from USD", () => {\n  expect(formatProductPrice({ numericPrice: 25, currency: "EUR" }))\n    .toContain("€");\n});\ntest("keeps legacy price text when no numeric value exists", () => {\n  expect(formatProductPrice({ price: "£12.00" })).toBe("£12.00");\n});\n',
  "tests/unit/productNormalization.test.cjs":
    "const test = require('node:test');\nconst assert = require('node:assert/strict');\nconst {parsePriceValue} = require('../../functions/shared/priceUtils');\nconst {includesKeyword} = require('../../functions/shared/stringUtils');\nconst {normalizeProductUrl, normalizeCurrency} =\n  require('../../functions/shared/productUtils');\nconst {normalizeAsosProduct: asos} =\n  require('../../functions/search/normalization/normalizeAsosProduct');\nconst {normalizeRealtimeProduct: realtime} =\n  require('../../functions/search/normalization/normalizeRealtimeProduct');\nconst {normalizeCombinedResults} =\n  require('../../functions/search/normalization/normalizeProducts');\nconst {inferAvailability, inferGender, inferCategory} =\n  require('../../functions/search/normalization/inferProductAttributes');\nconst {dedupeProducts} = require('../../functions/search/filtering/dedupeProducts');\nconst {applyProductFilters} =\n  require('../../functions/search/filtering/applyProductFilters');\nconst {sortProducts} = require('../../functions/search/filtering/sortProducts');\nconst a = (extra = {}) => ({id: 1, name: \"Women's blue shirt\",\n  url: '/product/1', price: {current: {value: 0}}, ...extra});\nconst r = (extra = {}) => ({product_id: '1', product_title: 'Blue shirt',\n  offer: {price: 20, currency: 'EUR', store_name: 'Shop',\n    offer_page_url: 'https://shop.example/product/1'}, ...extra});\n\ntest('zero remains a valid numeric price', () => {\n  assert.equal(parsePriceValue(0), 0);\n  assert.equal(parsePriceValue('$0.00'), 0);\n  assert.equal(asos(a()).numericPrice, 0);\n});\ntest('rejects nonfinite and negative prices', () => {\n  for (const x of [NaN, Infinity, -1, '-12', {}, [], true]) {\n    assert.equal(parsePriceValue(x), null);\n  }\n});\ntest('parses explicit dot-decimal grouping', () => {\n  assert.equal(parsePriceValue('USD 1,234.56'), 1234.56);\n});\ntest('comma decimal parsing requires explicit context', () => {\n  assert.equal(parsePriceValue('€1.234,56', {decimalSeparator: ','}), 1234.56);\n  assert.equal(parsePriceValue('€1.234,56'), null);\n  assert.equal(parsePriceValue('12,50'), null);\n});\ntest('ranges and prose do not masquerade as exact prices', () => {\n  for (const x of ['$10 - $20', 'from $10', '2 for $10', '', 'free']) {\n    assert.equal(parsePriceValue(x), null);\n  }\n});\ntest('URL handling supports known bases and rejects unsafe input', () => {\n  assert.equal(normalizeProductUrl('/p', 'https://shop.example'),\n      'https://shop.example/p');\n  assert.equal(normalizeProductUrl('//images.example/p'), 'https://images.example/p');\n  for (const x of ['javascript:alert(1)', 'data:image/png,x',\n    'https://user:pass@shop.example/p', 'https://shop.example/a b']) {\n    assert.equal(normalizeProductUrl(x), '');\n  }\n});\ntest('currency codes must be recognized', () => {\n  assert.equal(normalizeCurrency('eur'), 'EUR');\n  assert.equal(normalizeCurrency('ZZZ'), null);\n  assert.equal(normalizeCurrency('$'), null);\n});\ntest('absolute ASOS URLs are not double-prefixed', () => {\n  const item = asos(a({url: 'https://www.asos.com/p',\n    imageUrl: 'https://images.asos-media.com/p'}));\n  assert.equal(item.productUrl, 'https://www.asos.com/p');\n  assert.equal(item.imageUrl, 'https://images.asos-media.com/p');\n});\ntest('schemeless ASOS image hosts are normalized', () => {\n  assert.equal(asos(a({imageUrl: 'images.asos-media.com/p'})).imageUrl,\n      'https://images.asos-media.com/p');\n});\ntest('ASOS currency uses explicit metadata before US adapter fallback', () => {\n  assert.equal(asos(a()).currency, 'USD');\n  assert.equal(asos(a({price: {currency: 'GBP', current: {value: 10}}})).currency,\n      'GBP');\n});\ntest('malformed records are safely omitted', () => {\n  for (const x of [null, undefined, 2, [], {}, {name: 'x'}]) {\n    assert.equal(asos(x), null);\n    assert.equal(realtime(x), null);\n  }\n  assert.equal(normalizeCombinedResults([null, a()], [false, r()]).length, 2);\n});\ntest('public product shape excludes raw records', () => {\n  for (const item of [asos(a()), realtime(r())]) {\n    assert.ok(item.id);\n    assert.equal(item.itemId, item.id);\n    assert.ok(!('rawData' in item));\n    assert.equal(item.brand, '');\n    assert.doesNotThrow(() => JSON.stringify(item));\n  }\n});\ntest('offer and photo shapes are validated', () => {\n  assert.equal(realtime(r({offer: []})), null);\n  assert.equal(realtime(r({product_photos: 'https://images.example/p'})).imageUrl, '');\n  assert.equal(realtime(r({product_photos: [null, 'javascript:x',\n    'https://images.example/p']})).imageUrl, 'https://images.example/p');\n});\ntest('retailer remains source and provider is separate', () => {\n  const item = realtime(r());\n  assert.equal(item.source, 'Shop');\n  assert.equal(item.provider, 'realtime');\n});\ntest('unknown marketplace currency is not USD', () => {\n  const item = realtime(r({offer: {price: '$20',\n    offer_page_url: 'https://shop.example/p'}}));\n  assert.equal(item.currency, null);\n  assert.equal(item.source, 'shop.example');\n  assert.ok(item.price.includes('currency unconfirmed'));\n});\ntest('formatted price text preserves known currency for existing save schema', () => {\n  assert.ok(realtime(r()).price.includes('€'));\n  assert.ok(asos(a()).price.includes('$'));\n});\ntest('negative availability wins over positive substring', () => {\n  for (const value of ['unavailable', 'not available', 'out of stock',\n    'sold out', 'not in stock']) {\n    assert.equal(inferAvailability({availability: value}), 'outofstock');\n  }\n  assert.equal(inferAvailability({availability: 'available'}), 'instock');\n  assert.equal(inferAvailability(null), 'unknown');\n});\ntest('boolean inventory takes precedence', () => {\n  assert.equal(inferAvailability({inStock: false, availability: 'available'}),\n      'outofstock');\n});\ntest('keyword matching respects tokens and possessives', () => {\n  assert.equal(includesKeyword('woman', ['man']), false);\n  assert.equal(includesKeyword('female', ['male']), false);\n  assert.equal(includesKeyword('redwood', ['red']), false);\n  assert.equal(inferGender(\"Women's shirt\"), 'female');\n});\ntest('regular plurals retain useful category matching', () => {\n  assert.equal(inferCategory('leather boots'), 'shoes');\n  assert.equal(includesKeyword('dresses', ['dress']), true);\n});\ntest('different providers do not collide on the same raw ID', () => {\n  assert.equal(dedupeProducts([asos(a()), realtime(r())]).length, 2);\n});\ntest('same normalized identity deduplicates predictably', () => {\n  assert.equal(dedupeProducts([asos(a()), asos(a())]).length, 1);\n});\ntest('same marketplace ID at different retailers is distinct', () => {\n  const second = r(); second.offer.store_name = 'Other';\n  assert.notEqual(realtime(r()).id, realtime(second).id);\n});\ntest('zero maximum and unknown brand filters work', () => {\n  const items = [asos(a()), realtime(r())];\n  assert.equal(applyProductFilters(items, {priceMax: 0}).length, 1);\n  assert.equal(applyProductFilters(items, {brand: ['nike']}).length, 0);\n});\ntest('sort groups currencies, sorts within them, and retains unknown order', () => {\n  const items = [{numericPrice: 30, currency: 'USD'},\n    {numericPrice: 10, currency: 'USD'}, {numericPrice: 20, currency: 'EUR'},\n    {numericPrice: 1, currency: null}, {numericPrice: null, currency: 'USD'}];\n  const sorted = sortProducts(items, 'price_asc');\n  assert.deepEqual(sorted.map((x) => x.numericPrice), [20, 10, 30, 1, null]);\n  assert.deepEqual(sortProducts(items, 'relevance'), items);\n});\ntest('real normalization/filter/dedupe/sort pipeline retains zero-price product', () => {\n  const normalized = normalizeCombinedResults([a(), a()], [r()]);\n  const items = sortProducts(applyProductFilters(dedupeProducts(normalized),\n      {priceMax: 0}), 'price_asc');\n  assert.equal(items.length, 1);\n  assert.equal(items[0].numericPrice, 0);\n});\n",
  "functions/search/normalization/inferProductAttributes.js":
    "const CATEGORY_KEYWORDS = require('../constants/categoryKeywords');\nconst COLOR_KEYWORDS = require('../constants/colorKeywords');\nconst GENDER_KEYWORDS = require('../constants/genderKeywords');\nconst {normalizeString, includesKeyword} = require('../../shared/stringUtils');\n\nconst inferCategory = (name = '') => {\n  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {\n    if (includesKeyword(name, keywords)) {\n      return category;\n    }\n  }\n  return 'unknown';\n};\nconst inferColors = (name = '') => Object.entries(COLOR_KEYWORDS)\n    .filter(([, keywords]) => includesKeyword(name, keywords))\n    .map(([color]) => color);\nconst inferGender = (name = '') => {\n  const matches = Object.entries(GENDER_KEYWORDS)\n      .filter(([, keywords]) => includesKeyword(name, keywords))\n      .map(([gender]) => gender);\n  if (matches.includes('unisex')) {\n    return 'unisex';\n  }\n  return matches.length === 1 ? matches[0] : 'unknown';\n};\nconst inferAvailability = (value = {}) => {\n  const product = value && typeof value === 'object' && !Array.isArray(value) ?\n    value : {};\n  if (typeof product.inStock === 'boolean') {\n    return product.inStock ? 'instock' : 'outofstock';\n  }\n  const availability = normalizeString(product.availability);\n  if (includesKeyword(availability, [\n    'out of stock', 'outofstock', 'unavailable', 'sold out', 'not available',\n    'not in stock',\n  ])) {\n    return 'outofstock';\n  }\n  if (includesKeyword(availability, ['not', 'no', 'unknown'])) {\n    return 'unknown';\n  }\n  if (includesKeyword(availability, ['in stock', 'instock', 'available'])) {\n    return 'instock';\n  }\n  return 'unknown';\n};\nconst inferBrand = (product = {}) => {\n  for (const value of [product?.brandName, product?.brand]) {\n    if (typeof value === 'string' && value.trim()) {\n      return value.trim();\n    }\n  }\n  return '';\n};\nmodule.exports = {inferCategory, inferColors, inferGender, inferAvailability,\n  inferBrand};\n",
  "functions/search/filtering/applyProductFilters.js":
    "const {normalizeString} = require('../../shared/stringUtils');\n\nconst matchesArrayFilter = (productValue, selected = []) => {\n  if (!selected.length) {\n    return true;\n  }\n  return Array.isArray(productValue) ? productValue.some((value) =>\n    selected.includes(normalizeString(value))) :\n    selected.includes(normalizeString(productValue));\n};\nconst matchesPriceFilter = (price, min, max) => {\n  const hasMin = min !== '' && min != null;\n  const hasMax = max !== '' && max != null;\n  if (!hasMin && !hasMax) {\n    return true;\n  }\n  if (!Number.isFinite(price) || price < 0) {\n    return false;\n  }\n  return (!hasMin || price >= Number(min)) &&\n    (!hasMax || price <= Number(max));\n};\nconst matchesBrandFilter = (brand, selected = []) => {\n  if (!selected.length) {\n    return true;\n  }\n  const value = normalizeString(brand);\n  if (!value) {\n    return false;\n  }\n  return selected.some((candidate) => {\n    const expected = normalizeString(candidate);\n    return Boolean(expected) &&\n      (value.includes(expected) || expected.includes(value));\n  });\n};\nconst normalizeFilters = (filters = {}) => ({\n  gender: (filters.gender || []).map(normalizeString),\n  category: (filters.category || []).map(normalizeString),\n  size: (filters.size || []).map(normalizeString),\n  color: (filters.color || []).map(normalizeString),\n  brand: (filters.brand || []).map(normalizeString),\n  store: (filters.store || []).map(normalizeString),\n  availability: (filters.availability || []).map(normalizeString),\n  priceMin: filters.priceMin ?? '', priceMax: filters.priceMax ?? '',\n});\nconst applyProductFilters = (products = [], filters = {}) => {\n  const selected = normalizeFilters(filters);\n  return products.filter((product) => {\n    const matchesSize = !selected.size.length ||\n      !Array.isArray(product.size) || !product.size.length ||\n      matchesArrayFilter(product.size, selected.size);\n    return matchesArrayFilter(product.gender, selected.gender) &&\n      matchesArrayFilter(product.category, selected.category) && matchesSize &&\n      matchesArrayFilter(product.color, selected.color) &&\n      matchesArrayFilter(product.availability, selected.availability) &&\n      matchesArrayFilter(product.source, selected.store) &&\n      matchesBrandFilter(product.brand, selected.brand) &&\n      matchesPriceFilter(product.numericPrice, selected.priceMin, selected.priceMax);\n  });\n};\nmodule.exports = {applyProductFilters};\n",
};
const expected = {
  "functions/shared/priceUtils.js": "abd1942ea15bf497e44fca727691b9b75e5fbb16",
  "functions/shared/stringUtils.js": "b4b32f106633b33761456a2ad9ae9f8063c9d85d",
  "functions/search/normalization/normalizeAsosProduct.js":
    "af2d8e759b3c075a878b60bf4ebc5627738fbfcc",
  "functions/search/normalization/normalizeRealtimeProduct.js":
    "ed6eca52d2473371f0ebf4ee2d83689c27d23544",
  "functions/search/normalization/normalizeProducts.js":
    "4c44b102bce4e75e49b62b12e07ae01c78f738cf",
  "functions/search/normalization/inferProductAttributes.js":
    "e31d60efa46ed76e6f9b272c161f3903f6f1e988",
  "functions/search/filtering/dedupeProducts.js":
    "110523347282c4d3d3431592820eb6f4e84eeafe",
  "functions/search/filtering/sortProducts.js":
    "1ef8ed09733182b5d635b4211835a269076b9b85",
  "functions/search/filtering/applyProductFilters.js":
    "264eac39fd4581c86173fe213c3c8f4b0dd0a762",
  "src/features/search/components/SearchResultCard.jsx":
    "6e0f9eb5a466c04c960a2b3454ad14bd5830889c",
  "src/features/search/components/SearchResults.jsx":
    "9d169ca980ea5e1cad7054cbdc1bbddb59d50437",
};
const edits = [
  [
    "src/features/search/components/SearchResultCard.jsx",
    'const formatPrice = (result) => {\n  if (result?.price && String(result.price).trim()) return result.price;\n  if (typeof result?.numericPrice === "number") {\n    return `$${result.numericPrice.toFixed(2)}`;\n  }\n  return "Price unavailable";\n};',
    "const formatPrice = formatProductPrice;",
  ],
  [
    "src/features/search/components/SearchResultCard.jsx",
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { formatProductPrice } from "../utils/formatProductPrice";',
  ],
  [
    "src/features/search/components/SearchResultCard.jsx",
    'availability === "in_stock"',
    'availability === "instock"',
  ],
  [
    "src/features/search/components/SearchResultCard.jsx",
    'label={String(availability).replace(/_/g, " ")}',
    'label={availability === "instock" ? "In stock" :\n                availability === "outofstock" ? "Out of stock" : "Stock unknown"}',
  ],
  [
    "src/features/search/components/SearchResults.jsx",
    "result?.itemId || result?.productUrl || `${result?.name}-${index}`",
    'result?.id || `${result?.source || "unknown"}:${result?.itemId || result?.productUrl || `${result?.name}-${index}`}`',
  ],
];
const mode = process.argv[2] || "--check";
if (!["--check", "--apply"].includes(mode) || process.argv.length > 3) {
  throw new Error(
    "Usage: node scripts/apply-phase7-batch1.cjs [--check|--apply]",
  );
}
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
if (path.resolve(process.cwd()) !== path.resolve(root)) {
  throw new Error("Run from the repository root.");
}
const branch = execFileSync("git", ["branch", "--show-current"], {
  encoding: "utf8",
}).trim();
if (branch !== "refactor/v4-phase-7-provider-hardening") {
  throw new Error(`Expected Phase 7 branch, got: ${branch}`);
}
const blobHash = (content) =>
  createHash("sha1")
    .update(`blob ${Buffer.byteLength(content)}\0`)
    .update(content)
    .digest("hex");
const planned = new Map();
for (const [file, hash] of Object.entries(expected)) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (blobHash(content) !== hash) {
    throw new Error(`Source mismatch: ${file}. No files have been written.`);
  }
  planned.set(file, content);
}
for (const [file, before, after] of edits) {
  let content = planned.get(file);
  const count = content.split(before).length - 1;
  const expectedCount = before === 'availability === "in_stock"' ? 2 : 1;
  if (count !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} replacement(s), found ${count}: ${file}`,
    );
  }
  content = content.split(before).join(after);
  planned.set(file, content);
}
for (const [file, content] of Object.entries(replacements)) {
  if (!(file in expected) && fs.existsSync(path.join(root, file))) {
    throw new Error(
      `New target already exists: ${file}. No files have been written.`,
    );
  }
  planned.set(file, content);
}
for (const [file, content] of planned) {
  console.log(
    `${mode === "--apply" ? "WRITE" : "PLAN "} ${file} (${Buffer.byteLength(content)} bytes)`,
  );
}
if (mode === "--apply") {
  for (const [file, content] of planned) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  console.log(
    `Applied Phase 7 Batch 1 to ${planned.size} files. Run tests and lint before committing.`,
  );
} else {
  console.log(
    `Validated ${planned.size} targets. No files changed. Use --apply to write.`,
  );
}
