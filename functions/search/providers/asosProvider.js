const axios = require('axios');
const {getRapidApiKey} = require('../utils/rapidApi');
const {buildSearchQuery} = require('../utils/buildSearchQuery');
const {mapSortForAsos} = require('../utils/sortMappings');

const searchAsos = async ({
  query,
  gender,
  page = 1,
  pageSize = 24,
  sort = 'relevance',
}) => {
  const apiKey = getRapidApiKey();
  const finalQuery = buildSearchQuery(query, gender);
  const offset = Math.max(0, (Number(page) - 1) * Number(pageSize));

  const response = await axios.request({
    method: 'GET',
    url: 'https://asos2.p.rapidapi.com/products/v2/list',
    timeout: 9000,
    params: {
      store: 'US',
      offset: String(offset),
      categoryId: '4209',
      limit: String(pageSize),
      country: 'US',
      sort: mapSortForAsos(sort),
      q: finalQuery,
      currency: 'USD',
      sizeSchema: 'US',
      lang: 'en-US',
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'asos2.p.rapidapi.com',
    },
  });

  return response.data?.products || [];
};

module.exports = {
  searchAsos,
};
