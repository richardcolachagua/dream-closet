const {HttpsError} = require('firebase-functions/v1/https');
const {normalizeQuery} = require('../quota/searchQuotaService');

const FILTER_VALUES = Object.freeze({
  gender: ['female', 'male', 'unisex'],
  category: [
    'tops',
    'bottoms',
    'dresses',
    'outerwear',
    'shoes',
    'accessories',
    'activewear',
    'swimwear',
    'loungewear',
  ],
  size: [
    'xxs',
    'xs',
    's',
    'm',
    'l',
    'xl',
    'xxl',
    '0',
    '2',
    '4',
    '6',
    '8',
    '10',
    '12',
    '14',
    '16',
  ],
  color: [
    'black',
    'white',
    'gray',
    'beige',
    'brown',
    'blue',
    'navy',
    'green',
    'olive',
    'yellow',
    'orange',
    'red',
    'pink',
    'purple',
    'gold',
    'silver',
    'multi',
  ],
  brand: ['Zara', 'Aritzia', 'Reformation', 'COS'],
  store: ['ASOS', 'Amazon', 'Depop', 'Unknown'],
  availability: ['in_stock', 'out_of_stock', 'unknown'],
});

const SORTS = ['relevance', 'price_asc', 'price_desc', 'newest'];

const PAYLOAD_KEYS = ['query', 'gender', 'filters', 'sort', 'page', 'pageSize'];

const invalid = (message) => {
  throw new HttpsError('invalid-argument', message);
};

const plainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const assertObject = (value, label) => {
  if (!plainObject(value)) {
    invalid(`${label} must be an object.`);
  }
};

const assertKeys = (value, allowed, label) => {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    invalid(`${label} contains unsupported fields.`);
  }
};

const integer = (value, fallback, maximum, label) => {
  const selected = value === undefined ? fallback : value;

  if (!Number.isInteger(selected) || selected < 1 || selected > maximum) {
    invalid(`${label} must be an integer between 1 and ${maximum}.`);
  }

  return selected;
};

const price = (value, label) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1000000
  ) {
    invalid(`${label} must be a number between 0 and 1,000,000.`);
  }

  return value;
};

const validateFilters = (value = {}) => {
  assertObject(value, 'Filters');

  assertKeys(
      value,
      [...Object.keys(FILTER_VALUES), 'priceMin', 'priceMax'],
      'Filters',
  );

  const normalized = {};

  for (const [key, allowed] of Object.entries(FILTER_VALUES)) {
    const selected = value[key] === undefined ? [] : value[key];

    if (
      !Array.isArray(selected) ||
      selected.length > allowed.length ||
      selected.some(
          (item) => typeof item !== 'string' || !allowed.includes(item),
      ) ||
      new Set(selected).size !== selected.length
    ) {
      invalid(`Invalid ${key} filter selection.`);
    }

    normalized[key] = [...selected].sort();
  }

  normalized.priceMin = price(value.priceMin, 'Minimum price');
  normalized.priceMax = price(value.priceMax, 'Maximum price');

  if (
    normalized.priceMin !== null &&
    normalized.priceMax !== null &&
    normalized.priceMin > normalized.priceMax
  ) {
    invalid('Minimum price cannot exceed maximum price.');
  }

  return normalized;
};

const validateSearchPayload = (data) => {
  assertObject(data, 'Search payload');
  assertKeys(data, PAYLOAD_KEYS, 'Search payload');

  const query = normalizeQuery(data.query);
  const gender = data.gender === undefined ? '' : data.gender;
  const sort = data.sort === undefined ? 'relevance' : data.sort;

  if (!['', 'female', 'male', 'unisex'].includes(gender)) {
    invalid('Invalid shopping gender.');
  }

  if (!SORTS.includes(sort)) {
    invalid('Invalid search sort.');
  }

  return {
    query,
    gender,
    filters: validateFilters(data.filters),
    sort,
    page: integer(data.page, 1, 1000, 'Page'),
    pageSize: integer(data.pageSize, 24, 48, 'Page size'),
  };
};

const validateSearchRequest = (data) => {
  assertObject(data, 'Search request');

  assertKeys(data, [...PAYLOAD_KEYS, 'requestId', 'action'], 'Search request');

  if (
    typeof data.requestId !== 'string' ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(data.requestId)
  ) {
    invalid('A valid request ID is required.');
  }

  const action = data.action === undefined ? 'new' : data.action;

  if (!['new', 'retry', 'refine'].includes(action)) {
    invalid('Action must be new, retry, or refine.');
  }

  const payload = Object.fromEntries(
      PAYLOAD_KEYS.filter((key) => Object.hasOwn(data, key)).map((key) => [
        key,
        data[key],
      ]),
  );

  return {
    requestId: data.requestId,
    action,
    payload: validateSearchPayload(payload),
  };
};

const validateQuotaRequest = (data) => {
  if (data === undefined || data === null) {
    return;
  }

  assertObject(data, 'Quota request');
  assertKeys(data, [], 'Quota request');
};

module.exports = {
  FILTER_VALUES,
  SORTS,
  validateFilters,
  validateSearchPayload,
  validateSearchRequest,
  validateQuotaRequest,
};
