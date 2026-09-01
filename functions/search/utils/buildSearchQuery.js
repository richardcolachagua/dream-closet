const {normalizeString} = require('../../shared/stringUtils');

const buildSearchQuery = (query, gender) => {
  const normalizedGender = normalizeString(gender);

  if (normalizedGender === 'female') {
    return `women ${query}`;
  }

  if (normalizedGender === 'male') {
    return `men ${query}`;
  }

  if (normalizedGender === 'unisex') {
    return `unisex ${query}`;
  }

  return query;
};

module.exports = {
  buildSearchQuery,
};
