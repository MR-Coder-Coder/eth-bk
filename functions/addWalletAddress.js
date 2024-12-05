const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.addWalletAddress = functions.https.onCall(async (data, context) => {
  const { address, walletName, network } = data;
  
  try {
    // Determine which collection to use based on network
    let collectionName;
    if (network === 'ETH') {
      collectionName = 'eth_wallet_addresses';
    } else if (network === 'TRON') {
      collectionName = 'tron_wallet_addresses';
    } else {
      throw new Error('Invalid network specified. Must be either ETH or TRON');
    }

    // Add the wallet address to the appropriate collection
    const walletRef = db.collection(collectionName).doc();
    await walletRef.set({ 
      address, 
      wallet_name: walletName
    });

    return { 
      success: true, 
      message: `${network} wallet address added successfully.`
    };
  } catch (error) {
    console.error(`Error adding ${network} wallet address:`, error);
    return { 
      success: false, 
      message: error.message
    };
  }
});