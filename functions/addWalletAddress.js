const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.addWalletAddress = functions.https.onCall(async (data, context) => {
  const { address, walletName } = data;
  try {
    const walletRef = db.collection('wallet_addresses').doc();
    await walletRef.set({ address, wallet_name: walletName });
    return { success: true, message: 'Wallet address added successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});