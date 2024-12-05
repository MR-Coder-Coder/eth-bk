const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const TRONSCAN_API_KEY = process.env.TRONSCAN_API_KEY;
const TRONSCAN_API_URL = 'https://apilist.tronscanapi.com/api';

exports.fetchTronTransactions = functions.https.onCall(async (data, context) => {
  const { walletAddress, tokenSymbol } = data;
  const db = admin.firestore();

  try {
    console.log(`Fetching all Tron transactions for wallet: ${walletAddress}`);

    let trxTransactions = [];
    let tokenTransactions = [];
    let internalTransactions = [];

    // Fetch all Tron token addresses from Firestore
    const tokenSnapshot = await db.collection('tron_token_addresses').get();
    const tokenAddresses = {};

    tokenSnapshot.forEach(doc => {
      const tokenData = doc.data();
      tokenAddresses[tokenData.token_name.toUpperCase()] = tokenData.address;
    });

    // Always fetch TRX transactions
    console.log('Fetching TRX transactions...');
    const trxResponse = await axios.get(`${TRONSCAN_API_URL}/transaction`, {
      params: {
        address: walletAddress,
        limit: 50,
        sort: '-timestamp',
      },
      headers: {
        'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
      },
    });

    if (trxResponse.data?.data) {
      trxTransactions = trxResponse.data.data.map(tx => ({
        ...tx,
        transactionType: 'TRX',
        from: tx.ownerAddress,
        to: tx.toAddress,
        value: tx.amount,
        hash: tx.hash,
        timeStamp: Math.floor(tx.timestamp / 1000),
        isError: tx.confirmed ? '0' : '1',
      }));
    }

    // Always fetch internal transactions
    const internalResponse = await axios.get(`${TRONSCAN_API_URL}/internal-transaction`, {
      params: {
        address: walletAddress,
        limit: 50,
        sort: '-timestamp',
      },
      headers: {
        'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
      },
    });

    if (internalResponse.data?.data) {
      internalTransactions = internalResponse.data.data.map(tx => ({
        ...tx,
        transactionType: 'TRX',
        from: tx.fromAddress,
        to: tx.toAddress,
        value: tx.callValue,
        hash: tx.transactionHash,
        timeStamp: Math.floor(tx.timestamp / 1000),
        isError: '0',
      }));
    }

    // Always fetch all token transactions
    for (const [symbol, tokenAddress] of Object.entries(tokenAddresses)) {
      const tokenResponse = await axios.get(`${TRONSCAN_API_URL}/contract/events`, {
        params: {
          address: walletAddress,
          contract: tokenAddress,
          limit: 50,
          sort: '-timestamp',
        },
        headers: {
          'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
        },
      });

      if (tokenResponse.data?.data) {
        const tokenTxs = tokenResponse.data.data.map(tx => ({
          ...tx,
          transactionType: symbol,
          from: tx.fromAddress,
          to: tx.toAddress,
          value: tx.value,
          hash: tx.transactionHash,
          timeStamp: Math.floor(tx.timestamp / 1000),
          tokenDecimal: tx.tokenInfo?.decimals || 18,
          tokenSymbol: symbol,
          contractAddress: tokenAddress,
        }));
        tokenTransactions = [...tokenTransactions, ...tokenTxs];
      }
    }

    // Combine all transactions
    const combinedTransactions = [...trxTransactions, ...internalTransactions, ...tokenTransactions];

    if (combinedTransactions.length === 0) {
      throw new functions.https.HttpsError('not-found', 'No transactions found for the given wallet');
    }

    console.log('Returning combined Tron transactions:', combinedTransactions.length);
    return { transactions: combinedTransactions };
    
  } catch (error) {
    console.error('Error fetching Tron transactions:', error.message);
    throw new functions.https.HttpsError('internal', 'Error fetching Tron transactions', { details: error.message });
  }
});
