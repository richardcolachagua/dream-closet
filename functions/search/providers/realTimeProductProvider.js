const axios = require('axios');
const {getRapidApiKey} = require('../utils/rapidApi');
const {buildSearchQuery} = require('../utils/buildSearchQuery');
const {mapSortForRealtime} = require('../utils/sortMappings');
const {
  PROVIDER_TIMEOUT_MS,
  requireProductArray,
} = require('../services/providerExecution');

const searchRealTimeProducts = async ({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = 'relevance',
  signal,
}) => {
  const apiKey = getRapidApiKey();

  const response = await axios.request({
    method: 'GET',
    url: 'https://real-time-product-search.p.rapidapi.com/search-v2',
    timeout: PROVIDER_TIMEOUT_MS,
    signal,
    params: {
      q: buildSearchQuery(query, gender),
      country: 'us',
      language: 'en',
      page: String(page),
      limit: String(pageSize),
      sort_by: mapSortForRealtime(sort),
      product_condition: 'ANY',
      min_rating: 'ANY',
      return_filters: 'true',
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'real-time-product-search.p.rapidapi.com',
    },
  });

  return requireProductArray(response.data?.data?.products);
};

module.exports = {searchRealTimeProducts};
