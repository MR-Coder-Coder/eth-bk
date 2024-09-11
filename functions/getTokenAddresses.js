const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.getTokenAddresses = functions.https.onCall(async () => {
    try {
      const snapshot = await db.collection('token_addresses').get();
      let addresses = [];
      snapshot.forEach(doc => {
        addresses.push({ id: doc.id, ...doc.data() });
      });
      return addresses;
    } catch (error) {
      return { success: false, message: error.message };
    }
  });