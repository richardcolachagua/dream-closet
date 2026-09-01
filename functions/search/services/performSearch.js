const {searchAsos} = require('../providers/asosProvider');
const {
  searchRealTimeProducts,
} = require('../providers/realTimeProductProvider');

const {
  normalizeCombinedResults,
} = require('../normalization/normalizeProducts');

const {applyProductFilters} = require('../filtering/applyProductFilters');

const {dedupeProducts} = require('../filtering/dedupeProducts');

const {sortProducts} = require('../filtering/sortProducts');

const performSearch = async ({
  query,
  gender = '',
  filters = {},
  sort = 'relevance',
  page = 1,
  pageSize = 24,
}) => {
  const providerCalls = await Promise.allSettled([
    searchAsos({query, gender, page, pageSize, sort}),
    searchRealTimeProducts({query, gender, page, pageSize, sort}),
  ]);

  const asosResults =
    providerCalls[0].status === 'fulfilled' ? providerCalls[0].value : [];

  const realtimeResults =
    providerCalls[1].status === 'fulfilled' ? providerCalls[1].value : [];

  const warnings = [];

  if (providerCalls[0].status === 'rejected') {
    console.error('ASOS provider failed:', providerCalls[0].reason);
    warnings.push('ASOS search is temporarily unavailable.');
  }

  if (providerCalls[1].status === 'rejected') {
    console.error('Realtime product provider failed:', providerCalls[1].reason);

    warnings.push('Marketplace search is temporarily unavailable.');
  }

  const normalizedResults = normalizeCombinedResults(
      asosResults,
      realtimeResults,
  );

  const dedupedResults = dedupeProducts(normalizedResults);
  const filteredResults = applyProductFilters(dedupedResults, filters);
  const sortedResults = sortProducts(filteredResults, sort);

  const startIndex = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const endIndex = startIndex + Number(pageSize);

  return {
    results: sortedResults.slice(startIndex, endIndex),
    total: sortedResults.length,
    page: Number(page),
    pageSize: Number(pageSize),
    hasMore: endIndex < sortedResults.length,
    warnings,
    sources: {
      asos: asosResults.length,
      realtime: realtimeResults.length,
    },
  };
};

module.exports = {
  performSearch,
};
