const admin = require("firebase-admin");

const isFunctionsEmulator = process.env.FUNCTIONS_EMULATOR === "true";

if (isFunctionsEmulator) {
  const missingEmulators = [
    "FIREBASE_AUTH_EMULATOR_HOST",
    "FIRESTORE_EMULATOR_HOST",
  ].filter((name) => !process.env[name]);

  if (missingEmulators.length > 0) {
    throw new Error(
      "Unsafe local Firebase configuration. Missing: " +
        missingEmulators.join(", ") +
        ". Start Auth, Firestore, and Functions together.",
    );
  }
}

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

module.exports = {
  admin,
  db,
};
