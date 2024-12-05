const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.addTokenAddress = functions.https.onCall(async (data, context) => {
  const { address, tokenName, network } = data;
  
  try {
    // Determine which collection to use based on network
    let collectionName;
    if (network === 'ETH') {
      collectionName = 'eth_token_addresses';
    } else if (network === 'TRON') {
      collectionName = 'tron_token_addresses';
    } else {
      throw new Error('Invalid network specified. Must be either ETH or TRON');
    }

    // Add the token address to the appropriate collection
    const tokenRef = db.collection(collectionName).doc();
    await tokenRef.set({ 
      address, 
      token_name: tokenName
    });

    return { 
      success: true, 
      message: `${network} token address added successfully.`
    };
  } catch (error) {
    console.error(`Error adding ${network} token address:`, error);
    return { 
      success: false, 
      message: error.message
    };
  }
});