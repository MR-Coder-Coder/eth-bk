const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.filterTransactions = functions.https.onCall(async (data, context) => {
  try {
    const { transactions, network } = data;

    // Step 1: Filter out transactions with a value of 0 based on network
    const filteredTransactions = transactions.filter(tx => {
      if (network === 'ETH') {
        // Keep all non-ETH transactions and ETH transactions where value is not 0
        return tx.transactionType !== 'ETH' || tx.value !== '0';
      } else if (network === 'TRON') {
        // Keep all non-TRX transactions and TRX transactions where value is not 0
        return tx.transactionType !== 'TRX' || tx.value !== '0';
      }
      return true; // Keep all transactions if network is not specified
    });

    return { transactions: filteredTransactions };
  } catch (error) {
    console.error('Error filtering transactions:', error);
    throw new functions.https.HttpsError('internal', 'Error filtering transactions', error);
  }
});
