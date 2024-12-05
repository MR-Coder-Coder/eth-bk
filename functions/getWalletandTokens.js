const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.getWalletAndTokens = functions.https.onCall(async (data, context) => {
    const { network } = data;
    const db = admin.firestore();
  
    try {
      let walletCollection, tokenCollection;

      // Determine which collections to query based on network
      if (network === 'ETH') {
        walletCollection = 'eth_wallet_addresses';
        tokenCollection = 'eth_token_addresses';
      } else if (network === 'TRON') {
        walletCollection = 'tron_wallet_addresses';
        tokenCollection = 'tron_token_addresses';
      } else {
        throw new Error('Invalid network specified');
      }

      // Fetch wallet addresses with wallet_name and address
      const walletSnapshot = await db.collection(walletCollection).get();
      const wallets = walletSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          wallet_name: data.wallet_name,
          wallet_address: data.address
        };
      });
  
      // Fetch token names from Firestore
      const tokenSnapshot = await db.collection(tokenCollection).get();
      const tokens = tokenSnapshot.docs.map(doc => doc.data().token_name);
  
      // Add default tokens based on network
      const defaultToken = network === 'ETH' ? 'ETH' : 'TRX';
      const tokenList = ['ALL', defaultToken, ...tokens];
  
      return { wallets, tokens: tokenList };
    } catch (error) {
      console.error("Error fetching wallet addresses and tokens:", error);
      throw new functions.https.HttpsError('internal', 'Error fetching data', error);
    }
});
  
