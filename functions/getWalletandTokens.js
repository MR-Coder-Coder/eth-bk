const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.getWalletAndTokens = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  try {
    // Fetch wallet addresses
    const walletSnapshot = await db.collection('wallet_addresses').get();
    const wallets = walletSnapshot.docs.map(doc => doc.data());

    // Fetch token names from Firestore
    const tokenSnapshot = await db.collection('token_addresses').get();
    const tokens = tokenSnapshot.docs.map(doc => doc.data().token_name);

    // Add default 'ALL' and 'ETH' to tokens list
    const tokenList = ['ALL', 'ETH', ...tokens];

    return { wallets, tokens: tokenList };
  } catch (error) {
    console.error("Error fetching wallet addresses and tokens:", error);
    throw new functions.https.HttpsError('internal', 'Error fetching data', error);
  }
});
