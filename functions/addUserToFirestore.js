const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.addUserToFirestore = functions.auth.user().onCreate((user) => {
  const userId = user.uid;
  const userDoc = admin.firestore().collection('user').doc(userId);

  return userDoc.set({
    role: 'user'
  });
});
