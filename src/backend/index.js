const functions = require("firebase-functions");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");

admin.initializeApp();

const db = admin.firestore();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per WindowMs
});

exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to update profile"
    );
  }

  const uid = context.auth.uid;
  const { firstName, lastName, email, newPassword } = data;

  try {
    // Update user profile in Firebase Auth
    const updatePromises = [];

    if (firstName || lastName) {
      updatePromises.push(
        admin.auth().updateUser(uid, {
          displayName: `${firstName} ${lastName}`.trim(),
        })
      );
    }

    if (email) {
      updatePromises.push(admin.auth().updateUser(uid, { email }));
    }

    if (newPassword) {
      updatePromises.push(
        admin.auth().updateUser(uid, { password: newPassword })
      );
    }

    await Promise.all(updatePromises);

    // Update user data in Firestore
    const userRef = admin.firestore().collection("users").doc(uid);
    await userRef.set(
      {
        firstName,
        lastName,
        email,
      },
      { merge: true }
    );

    return { message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while updating the profile"
    );
  }
});
