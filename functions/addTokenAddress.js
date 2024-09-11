const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.addTokenAddress = functions.https.onCall(async (data, context) => {
    const { address, tokenName } = data;
    try {
      const tokenRef = db.collection('token_addresses').doc();
      await tokenRef.set({ address, token_name: tokenName });
      return { success: true, message: 'Token address added successfully.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });