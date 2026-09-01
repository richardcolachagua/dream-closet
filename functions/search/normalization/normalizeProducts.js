const {normalizeAsosProduct} = require('./normalizeAsosProduct');

const {normalizeRealtimeProduct} = require('./normalizeRealtimeProduct');

const normalizeCombinedResults = (asosResults = [], realTimeResults = []) => {
  const normalizedAsos = Array.isArray(asosResults) ?
    asosResults.map(normalizeAsosProduct) :
    [];

  const normalizedRealtime = Array.isArray(realTimeResults) ?
    realTimeResults.map(normalizeRealtimeProduct) :
    [];

  return [...normalizedAsos, ...normalizedRealtime];
};

module.exports = {
  normalizeCombinedResults,
};
