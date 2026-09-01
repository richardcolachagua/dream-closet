const axios = require('axios');
const {getRapidApiKey} = require('../utils/rapidApi');
const {buildSearchQuery} = require('../utils/buildSearchQuery');
const {mapSortForRealtime} = require('../utils/sortMappings');

const searchRealTimeProducts = async ({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = 'relevance',
}) => {
  const apiKey = getRapidApiKey();
  const finalQuery = buildSearchQuery(query, gender);

  const response = await axios.request({
    method: 'GET',
    url: 'https://real-time-product-search.p.rapidapi.com/search-v2',
    timeout: 9000,
    params: {
      q: finalQuery,
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

  return response.data?.data?.products || [];
};

module.exports = {
  searchRealTimeProducts,
};
