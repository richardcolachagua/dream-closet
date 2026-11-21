const functions = require('firebase-functions/v1');
const {HttpsError} = require('firebase-functions/v1/https');
const {db} = require('../config/firebase');
const {createSearchQuotaService} = require('./quota/searchQuotaService');
const {createSearchHandlers} = require('./searchHandlers');

const quotaService = createSearchQuotaService({db});

const handlers = createSearchHandlers({
  quotaService,
  executionService: {
    runSearch: async () => {
      throw new HttpsError(
          'internal',
          'Search execution is not available in the quota handler.',
      );
    },
  },
});

const checkSearchLimit = functions
    .runWith({
      timeoutSeconds: 30,
      memory: '256MB',
      enforceAppCheck: false,
    })
    .https.onCall(handlers.checkSearchLimit);

module.exports = {
  checkSearchLimit,
};
