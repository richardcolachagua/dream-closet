const {normalizeAsosProduct} = require('./normalizeAsosProduct');
const {normalizeRealtimeProduct} = require('./normalizeRealtimeProduct');

const normalizeCombinedResults = (asosResults = [], realTimeResults = []) => [
  ...(Array.isArray(asosResults) ? asosResults : []).map(normalizeAsosProduct),
  ...(Array.isArray(realTimeResults) ? realTimeResults : [])
      .map(normalizeRealtimeProduct),
].filter(Boolean);

module.exports = {normalizeCombinedResults};
