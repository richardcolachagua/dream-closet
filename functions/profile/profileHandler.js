const {normalizeName, validateProfileData} = require('./profileValidation');

const createProfileHandler = ({db, admin, HttpsError, logger = console}) => {
  return async (data, context) => {
    if (
      !context.auth?.uid ||
      context.auth.token?.firebase?.sign_in_provider === 'anonymous'
    ) {
      throw new HttpsError(
          'unauthenticated',
          'A registered account is required.',
      );
    }
    const errors = validateProfileData(data);
    if (errors.length) {
      throw new HttpsError('invalid-argument', errors.join(' '));
    }
    const uid = context.auth.uid;
    const reference = db.collection('users').doc(uid);
    let names;
    try {
      names = await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists) {
          throw new HttpsError(
              'failed-precondition',
              'Sign in again to initialize your profile.',
          );
        }
        const current = snapshot.data();
        const next = {
          firstName: Object.prototype.hasOwnProperty.call(data, 'firstName') ?
            normalizeName(data.firstName) :
            current.firstName,
          lastName: Object.prototype.hasOwnProperty.call(data, 'lastName') ?
            normalizeName(data.lastName) :
            current.lastName,
        };
        if (
          typeof next.firstName !== 'string' ||
          typeof next.lastName !== 'string'
        ) {
          throw new HttpsError(
              'failed-precondition',
              'Your profile needs a data repair.',
          );
        }
        transaction.update(reference, {
          ...next,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return next;
      });
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Profile write failed', {uid, code: error.code});
      throw new HttpsError(
          'internal',
          'Could not save your profile. Please retry.',
      );
    }

    let authDisplayNameSynced = true;
    try {
      const current = await reference.get();
      if (current.exists) {
        const latest = current.data();
        await admin.auth().updateUser(uid, {
          displayName: `${latest.firstName} ${latest.lastName}`.trim(),
        });
      } else {
        authDisplayNameSynced = false;
      }
    } catch (error) {
      authDisplayNameSynced = false;
      logger.warn('Profile saved; Auth display name sync failed', {
        uid,
        code: error.code,
      });
    }
    return {message: 'Profile saved.', ...names, authDisplayNameSynced};
  };
};
module.exports = {createProfileHandler};
