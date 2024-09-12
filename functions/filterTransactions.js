const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.filterTransactions = functions.https.onCall(async (data, context) => {
  try {
    const { transactions } = data;

    // Step 1: Separate ETH and USDT transactions
    const ethTransactions = transactions.filter(tx => tx.transactionType === 'ETH');
    const usdtTransactions = transactions.filter(tx => tx.transactionType === 'USDT');

    // Step 2: Filter out ETH transactions that meet the criteria
    const filteredEthTransactions = ethTransactions.filter(ethTx => {
      return !usdtTransactions.some(usdtTx => 
        ethTx.humanReadableTime === usdtTx.humanReadableTime && // Same human-readable time
        ethTx.gas === usdtTx.gas && // Same gas
        ethTx.value === '0'         // ETH transaction has a value of 0
      );
    });

    // Step 3: Combine remaining ETH transactions with the original USDT transactions
    const finalTransactions = [...filteredEthTransactions, ...usdtTransactions];

    return { transactions: finalTransactions };
  } catch (error) {
    console.error('Error filtering transactions:', error);
    throw new functions.https.HttpsError('internal', 'Error filtering transactions', error);
  }
});
