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
const {SEARCH_BUDGET_MS, runProvider} = require('./providerExecution');

const performSearch = async ({
  query,
  gender = '',
  filters = {},
  sort = 'relevance',
  page = 1,
  pageSize = 24,
}) => {
  const request = {query, gender, page, pageSize, sort};
  const deadlineAt = Date.now() + SEARCH_BUDGET_MS;
  const calls = await Promise.all([
    runProvider({
      name: 'asos',
      search: searchAsos,
      request,
      deadlineAt,
      normalize: (items) => normalizeCombinedResults(items, []),
    }),
    runProvider({
      name: 'realtime',
      search: searchRealTimeProducts,
      request,
      deadlineAt,
      normalize: (items) => normalizeCombinedResults([], items),
    }),
  ]);
  const warnings = [];
  const labels = ['ASOS', 'Marketplace'];
  calls.forEach((call, index) => {
    if (call.status === 'rejected') {
      // Never log the Axios error, headers, request config, or user query.
      console.error('search_provider_health', call.health);
      warnings.push(`${labels[index]} search is temporarily unavailable.`);
    } else if (typeof console.info === 'function') {
      console.info('search_provider_health', call.health);
    }
  });
  if (calls.every((call) => call.status === 'rejected')) {
    const error = new Error(
        'All search providers are temporarily unavailable.',
    );
    error.code = 'SEARCH_ALL_PROVIDERS_FAILED';
    throw error;
  }
  const normalized = [...calls[0].value, ...calls[1].value];
  const results = sortProducts(
      applyProductFilters(dedupeProducts(normalized), filters),
      sort,
  );
  return {
    results,
    total: results.length,
    totalScope: 'provider-window',
    paginationMode: 'provider-window-v1',
    page: Number(page),
    pageSize: Number(pageSize),
    hasMore:
      Number(page) < 1000 &&
      calls.some(
          (call) =>
            call.status === 'fulfilled' && call.receivedCount >= Number(pageSize),
      ),
    warnings,
    ordering: {
      asos: sort === 'relevance' ? 'provider-default-unverified' : sort,
      realtime: sort === 'relevance' ? 'best-match-unverified' : sort,
    },
    sources: {
      asos: calls[0].status === 'fulfilled' ? calls[0].receivedCount : 0,
      realtime: calls[1].status === 'fulfilled' ? calls[1].receivedCount : 0,
    },
  };
};
module.exports = {performSearch};
