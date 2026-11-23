const functions = require('firebase-functions/v1');
const {HttpsError} = require('firebase-functions/v1/https');
const {db} = require('../config/firebase');
const {createSearchQuotaService} = require('./quota/searchQuotaService');
const {createSearchHandlers} = require('./searchHandlers');

const {createEntitlementRefresh} = require('./quota/entitlementRefresh');
const {searchAppCheckEnforced} = require('./utils/searchReleaseConfig');
const quotaService = createSearchQuotaService({
  db, refreshEntitlement: createEntitlementRefresh({db}).refresh,
});

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
      enforceAppCheck: searchAppCheckEnforced(),
    })
    .https.onCall(handlers.checkSearchLimit);

module.exports = {
  checkSearchLimit,
};
