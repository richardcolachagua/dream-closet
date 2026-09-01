const functions = require('firebase-functions');

const ALLOWED_SORTS = new Set([
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
]);

const validateSearchPayload = (data = {}) => {
  const query = typeof data.query === 'string' ? data.query.trim() : '';

  if (!query) {
    throw new functions.https.HttpsError(
        'invalid-argument',
        'Query is required.',
    );
  }

  if (query.length > 250) {
    throw new functions.https.HttpsError(
        'invalid-argument',
        'Search query is too long.',
    );
  }

  const requestedSort = typeof data.sort === 'string' ? data.sort : 'relevance';

  return {
    query,
    gender: typeof data.gender === 'string' ? data.gender : '',
    filters:
      typeof data.filters === 'object' && data.filters ? data.filters : {},
    sort: ALLOWED_SORTS.has(requestedSort) ? requestedSort : 'relevance',
    page: Number.isFinite(Number(data.page)) ?
      Math.max(1, Number(data.page)) :
      1,
    pageSize: Number.isFinite(Number(data.pageSize)) ?
      Math.min(48, Math.max(1, Number(data.pageSize))) :
      24,
  };
};

module.exports = {
  validateSearchPayload,
};
