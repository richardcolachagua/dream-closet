const functions = require('firebase-functions/v1');
const {admin, db, FieldValue} = require('../config/firebase');
const {createProfileHandler} = require('./profileHandler');

const updateUserProfile = functions.https.onCall(
    createProfileHandler({
      db,
      admin,
      FieldValue,
      HttpsError: functions.https.HttpsError,
    }),
);

module.exports = {updateUserProfile};
