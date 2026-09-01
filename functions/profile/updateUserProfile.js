const functions = require('firebase-functions');
const {admin, db} = require('../config/firebase');
const {
  validateProfileData,
  isRecentlyAuthenticated,
} = require('./profileValidation');

const updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to update your profile.',
    );
  }

  const validationErrors = validateProfileData(data);

  if (validationErrors.length > 0) {
    throw new functions.https.HttpsError(
        'invalid-argument',
        validationErrors.join(' '),
    );
  }

  const uid = context.auth.uid;
  const {firstName, lastName, email} = data;

  const isSensitiveUpdate = typeof email === 'string';

  if (isSensitiveUpdate && !isRecentlyAuthenticated(context)) {
    throw new functions.https.HttpsError(
        'failed-precondition',
        'Recent authentication is required to change your email.',
    );
  }

  try {
    const authUpdates = {};
    const firestoreUpdates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (typeof firstName === 'string') {
      firestoreUpdates.firstName = firstName.trim();
    }

    if (typeof lastName === 'string') {
      firestoreUpdates.lastName = lastName.trim();
    }

    if (typeof firstName === 'string' || typeof lastName === 'string') {
      const authUser = await admin.auth().getUser(uid);

      const nextFirstName =
        typeof firstName === 'string' ?
          firstName.trim() :
          authUser.displayName?.split(' ')[0] || '';

      const nextLastName =
        typeof lastName === 'string' ?
          lastName.trim() :
          authUser.displayName?.split(' ').slice(1).join(' ') || '';

      authUpdates.displayName = `${nextFirstName} ${nextLastName}`.trim();
    }

    if (typeof email === 'string') {
      const normalizedEmail = email.trim().toLowerCase();

      authUpdates.email = normalizedEmail;
      firestoreUpdates.email = normalizedEmail;
    }

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(uid, authUpdates);
    }

    if (Object.keys(firestoreUpdates).length > 1) {
      await db
          .collection('users')
          .doc(uid)
          .set(firestoreUpdates, {merge: true});
    }

    return {
      message: 'Profile updated successfully.',
    };
  } catch (error) {
    console.error('Failed to update user profile:', {
      uid,
      code: error?.code,
      message: error?.message,
    });

    if (error?.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
          'already-exists',
          'That email address is already in use.',
      );
    }

    throw new functions.https.HttpsError(
        'internal',
        'An error occurred while updating your profile.',
    );
  }
});

module.exports = {
  updateUserProfile,
};
