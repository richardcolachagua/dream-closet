const axios = require('axios');
const {getRapidApiKey} = require('../utils/rapidApi');
const {buildSearchQuery} = require('../utils/buildSearchQuery');
const {mapSortForAsos} = require('../utils/sortMappings');
const {
  PROVIDER_TIMEOUT_MS,
  requireProductArray,
} = require('../services/providerExecution');

const searchAsos = async ({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = 'relevance',
  signal,
}) => {
  const apiKey = getRapidApiKey();
  const offset = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const mappedSort = mapSortForAsos(sort);

  const response = await axios.request({
    method: 'GET',
    url: 'https://asos2.p.rapidapi.com/products/v2/list',
    timeout: PROVIDER_TIMEOUT_MS,
    signal,
    params: {
      store: 'US',
      offset: String(offset),
      categoryId: '4209',
      limit: String(pageSize),
      country: 'US',
      ...(mappedSort ? {sort: mappedSort} : {}),
      q: buildSearchQuery(query, gender),
      currency: 'USD',
      sizeSchema: 'US',
      lang: 'en-US',
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'asos2.p.rapidapi.com',
    },
  });

  return requireProductArray(response.data?.products);
};

module.exports = {searchAsos};
