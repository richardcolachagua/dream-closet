const functions = require('firebase-functions/v1');
const {admin, db} = require('../config/firebase');
const {createProfileHandler} = require('./profileHandler');

const updateUserProfile = functions.https.onCall(
    createProfileHandler({
      db,
      admin,
      HttpsError: functions.https.HttpsError,
    }),
);

module.exports = {updateUserProfile};
