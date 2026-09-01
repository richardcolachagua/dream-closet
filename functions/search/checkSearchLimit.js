const functions = require('firebase-functions');

const checkSearchLimit = functions.https.onCall(async () => ({
  remainingSearches: 3,
  resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}));

module.exports = {
  checkSearchLimit,
};
