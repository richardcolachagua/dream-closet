const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const { createCheckoutSession } = require("./src/stripe/createCheckoutSession");
const {
  createCustomerPortalSession,
} = require("./src/stripe/createCustomerPortalSession");
const { stripeWebhook } = require("./src/stripe/stripeWebhook");

exports.createCheckoutSession = createCheckoutSession;
exports.createCustomerPortalSession = createCustomerPortalSession;
exports.stripeWebhook = stripeWebhook;
