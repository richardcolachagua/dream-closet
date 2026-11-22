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

  if (providerCalls.every((call) => call.status === 'rejected')) {
    const error = new Error('All search providers are temporarily unavailable.');
    error.code = 'SEARCH_ALL_PROVIDERS_FAILED';
    throw error;
  }

  const normalizedResults = normalizeCombinedResults(
      asosResults,
      realtimeResults,
  );

  const dedupedResults = dedupeProducts(normalizedResults);
  const filteredResults = applyProductFilters(dedupedResults, filters);
  const sortedResults = sortProducts(filteredResults, sort);

  // A page is one upstream window per provider, not a combined slice.
  const hasMore = Number(page) < 1000 && providerCalls.some((call) =>
    call.status === 'fulfilled' && call.value.length >= Number(pageSize),
  );

  return {
    results: sortedResults,
    total: sortedResults.length,
    totalScope: 'provider-window',
    paginationMode: 'provider-window-v1',
    page: Number(page),
    pageSize: Number(pageSize),
    hasMore,
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
