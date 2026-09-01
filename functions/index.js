const {admin} = require('./config/firebase');

const {searchProducts} = require('./search/searchProducts');

const {checkSearchLimit} = require('./search/checkSearchLimit');

const {updateUserProfile} = require('./profile/updateUserProfile');

const {
  createCheckoutSession,
} = require('./pricing/services/createCheckoutSession');

const {
  createCustomerPortalSession,
} = require('./pricing/services/createCustomerPortalSession');

const {stripeWebhook} = require('./pricing/services/stripeWebhook');

const {deleteAccount} = require('./pricing/services/deleteAccount');

// Keep the import so Firebase Admin initializes once when the Functions
// runtime loads this file.
void admin;

exports.searchProducts = searchProducts;
exports.checkSearchLimit = checkSearchLimit;
exports.updateUserProfile = updateUserProfile;

exports.createCheckoutSession = createCheckoutSession;
exports.createCustomerPortalSession = createCustomerPortalSession;
exports.stripeWebhook = stripeWebhook;
exports.deleteAccount = deleteAccount;
