const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const {
  createCheckoutSession,
} = require("./pricing/services/createCheckoutSession");

const {
  createCustomerPortalSession,
} = require("./pricing/services/createCustomerPortalSession");

const { stripeWebhook } = require("./pricing/services/stripeWebhook");
const { deleteAccount } = require("./pricing/services/deleteAccount");

exports.deleteAccount = deleteAccount;
exports.createCheckoutSession = createCheckoutSession;
exports.createCustomerPortalSession = createCustomerPortalSession;
exports.stripeWebhook = stripeWebhook;
