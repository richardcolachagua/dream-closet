const {createHash} = require('node:crypto');

const record = (value) =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value, limit = 300) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : '';
const normalizeProductUrl = (value, base) => {
  const input = text(value, 4097);
  const hasControlCharacter = Array.from(input).some(
      (character) => character.charCodeAt(0) <= 31,
  );
  if (
    !input ||
    input.length > 4096 ||
    /[\s\\]/u.test(input) ||
    hasControlCharacter
  ) {
    return '';
  }
  try {
    const url = new URL(
      input.startsWith('//') ? `https:${input}` : input,
      base,
    );
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return '';
    }
    return url.href;
  } catch {
    return '';
  }
};
const currencies = new Set(Intl.supportedValuesOf('currency'));
const normalizeCurrency = (value) => {
  const code = text(value, 4).toUpperCase();
  return currencies.has(code) ? code : null;
};
const productIdentity = (provider, sourceId, productUrl) => {
  const id =
    typeof sourceId === 'number' && Number.isFinite(sourceId) ?
      String(sourceId) :
      text(sourceId, 512);
  return `${provider}:${createHash('sha256')
      .update(id ? `id:${id}` : `url:${productUrl}`)
      .digest('hex')}`;
};
const imageUrl = (values, base) => {
  if (!Array.isArray(values)) {
    return '';
  }
  for (const value of values) {
    const result = normalizeProductUrl(value, base);
    if (result) {
      return result;
    }
  }
  return '';
};
const displayPrice = (amount, currency) => {
  if (amount === null) {
    return 'Price unavailable';
  }
  if (currency) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      // Unknown currency codes must not imply dollars.
    }
  }
  return `${amount} (currency unconfirmed)`;
};
module.exports = {
  record,
  text,
  normalizeProductUrl,
  normalizeCurrency,
  displayPrice,
  productIdentity,
  imageUrl,
};
