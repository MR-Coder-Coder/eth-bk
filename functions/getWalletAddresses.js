const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();
exports.getWalletAddresses = functions.https.onCall(async () => {
    try {
      // Fetch ETH wallet addresses
      const ethSnapshot = await db.collection('eth_wallet_addresses').get();
      const ethAddresses = ethSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        network: 'ETH'
      }));

      // Fetch TRON wallet addresses
      const tronSnapshot = await db.collection('tron_wallet_addresses').get();
      const tronAddresses = tronSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        network: 'TRON'
      }));

      // Combine both address lists
      const addresses = [...ethAddresses, ...tronAddresses];
      
      return addresses;
    } catch (error) {
      return { success: false, message: error.message };
    }
});