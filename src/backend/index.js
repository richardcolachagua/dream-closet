const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Input validation utlitity
function validateProfileData(data) {
  const errors = [];
  if (
    data.firstName &&
    (typeof data.firstName !== "string" ||
      data.firstName.length < 1 ||
      data.firstName.length > 50)
  ) {
    errors.push("Invalid first name");
  }
  if (
    data.lastName &&
    (typeof data.lastName !== "string" ||
      data.lastName.length < 1 ||
      data.lastName.length > 50)
  ) {
    errors.push("Invalid last name");
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email address");
  }
  if (data.newPassword && typeof data.newPassword !== "string") {
    errors.push("Password must be a string");
  }
  return errors;
}

// Require recent authentication (within 5 minutes)
function isRecentlyAuthenticated(context) {
  const FIVE_MINUTES = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  const authTime = context.auth.token.auth_time;
  return now - authTime < FIVE_MINUTES;
}

exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to update profile"
    );
  }

  // Input validation
  const validationErrors = validateProfileData(data);
  if (validationErrors.length > 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      validationErrors.join(", ")
    );
  }

  // Require recent signin for sensitive updates
  if ((data.email || data.newPassword) && !isRecentlyAuthenticated(context)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Recent authentication required for sensitive updates."
    );
  }

  const uid = context.auth.uid;
  const { firstName, lastName, email, newPassword } = data;

  try {
    // Only updates provided and valid fields in Auth
    const authUpdates = {};
    if (typeof firstName === "string" && typeof lastName === "string") {
      authUpdates.displayName = `${firstName} ${lastName}`.trim();
    }
    if (typeof email === "string") {
      authUpdates.email = email;
    }
    if (typeof newPassword === "string") {
      authUpdates.password = newPassword;
    }
    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(uid, authUpdates);
    }
    // Only update valid Firestore fields
    const firestoreUpdates = {};
    if (typeof firstName === "string") firestoreUpdates.firstName = firstName;
    if (typeof lastName === "string") firestoreUpdates.lastName = lastName;
    if (typeof email === "string") firestoreUpdates.email = email;

    if (Object.keys(firestoreUpdates).length > 0) {
      await db
        .collection("users")
        .doc(uid)
        .set(firestoreUpdates, { merge: true });
    }
    // Log changes for audit
    console.log(`User profile updated for UID: ${uid}`, {
      updates: { authUpdates, firestoreUpdates },
    });
    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occured while updating the profile"
    );
  }
});
