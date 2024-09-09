// Cloud Function (index.js)
const functions = require('firebase-functions');
const axios = require('axios');

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const USDT_CONTRACT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';

exports.fetchTransactions = functions.https.onCall(async (data, context) => {
  const { walletAddress } = data;

  try {
    let ethTransactions = [];
    let usdtTransactions = [];
    let internalTransactions = [];

    // Fetch ETH transactions
    const ethResponse = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (ethResponse.data.status === '1') {
      ethTransactions = ethResponse.data.result.map(tx => ({
        ...tx,
        transactionType: 'ETH',
      }));
    } else {
      throw new functions.https.HttpsError('invalid-argument', ethResponse.data.message);
    }

    // Fetch USDT transactions
    const usdtResponse = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: walletAddress,
        contractaddress: USDT_CONTRACT_ADDRESS,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (usdtResponse.data.status === '1') {
      usdtTransactions = usdtResponse.data.result.map(tx => ({
        ...tx,
        transactionType: 'USDT',
      }));
    } else {
      throw new functions.https.HttpsError('invalid-argument', usdtResponse.data.message);
    }

    // Fetch internal transactions
    const internalResponse = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (internalResponse.data.status === '1') {
      internalTransactions = internalResponse.data.result.map(tx => ({
        ...tx,
        transactionType: 'ETH',
      }));
    } else {
      throw new functions.https.HttpsError('invalid-argument', internalResponse.data.message);
    }

    // Combine all transactions
    const combinedTransactions = [...ethTransactions, ...usdtTransactions, ...internalTransactions];
    // Sort combined transactions by timeStamp descending
    combinedTransactions.sort((a, b) => b.timeStamp - a.timeStamp);

    return combinedTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching transactions', error);
  }
});
