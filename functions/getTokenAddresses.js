const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.getTokenAddresses = functions.https.onCall(async () => {
    try {
      // Fetch ETH token addresses
      const ethSnapshot = await db.collection('eth_token_addresses').get();
      const ethTokens = ethSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        network: 'ETH'
      }));

      // Fetch TRON token addresses
      const tronSnapshot = await db.collection('tron_token_addresses').get();
      const tronTokens = tronSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        network: 'TRON'
      }));

      // Combine both token lists
      const addresses = [...ethTokens, ...tronTokens];
      
      return addresses;
    } catch (error) {
      return { success: false, message: error.message };
    }
});