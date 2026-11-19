const writeAccountProfileUnlessDeleting = async (db, uid, data) =>
  db.runTransaction(async (transaction) => {
    const userRef = db.doc(`users/${uid}`);
    const deletionRef = db.doc(`accountDeletions/${uid}`);
    const [deletionSnapshot, userSnapshot] = await Promise.all([
      transaction.get(deletionRef),
      transaction.get(userRef),
    ]);

    if (deletionSnapshot.exists || !userSnapshot.exists) return false;

    transaction.set(userRef, data, {merge: true});
    return true;
  });

const isAccountDeletionInProgress = async (db, uid) =>
  (await db.doc(`accountDeletions/${uid}`).get()).exists;

module.exports = {
  isAccountDeletionInProgress,
  writeAccountProfileUnlessDeleting,
};
