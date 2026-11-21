const functions = require('firebase-functions/v1');
const {db} = require('../config/firebase');
const {createSearchQuotaService} = require('./quota/searchQuotaService');
const {
  createSearchExecutionService,
} = require('./services/searchExecutionService');
const {performSearch} = require('./services/performSearch');
const {createSearchHandlers} = require('./searchHandlers');

const quotaService = createSearchQuotaService({db});

const executionService = createSearchExecutionService({
  db,
  quotaService,
  performSearch,
});

const handlers = createSearchHandlers({
  quotaService,
  executionService,
});

const searchProducts = functions
    .runWith({
      timeoutSeconds: 120,
      memory: '512MB',
      enforceAppCheck: false,
    })
    .https.onCall(handlers.searchProducts);

module.exports = {
  searchProducts,
};
