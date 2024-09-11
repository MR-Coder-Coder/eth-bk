const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

exports.fetchTransactions = functions.https.onCall(async (data, context) => {
  const { walletAddress, tokenSymbol } = data;
  
  const db = admin.firestore();
  
  try {
    console.log(`Fetching transactions for wallet: ${walletAddress}, token: ${tokenSymbol}`);

    let ethTransactions = [];
    let tokenTransactions = [];
    let internalTransactions = [];

    // Fetch all token addresses from Firestore
    const tokenSnapshot = await db.collection('token_addresses').get();
    const tokenAddresses = {};
    
    tokenSnapshot.forEach(doc => {
      const tokenData = doc.data();
      tokenAddresses[tokenData.token_name.toUpperCase()] = tokenData.address;
    });

    console.log('Fetched token addresses from Firestore:', tokenAddresses);

    // Fetch ETH transactions if tokenSymbol is 'ETH' or 'All'
    if (!tokenSymbol || tokenSymbol.toUpperCase() === 'ETH' || tokenSymbol.toUpperCase() === 'ALL') {
      console.log('Fetching ETH transactions...');
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
        console.log('No ETH transactions found');
      }
    }

    // Fetch internal transactions if tokenSymbol is 'ETH' or 'All'
    if (!tokenSymbol || tokenSymbol.toUpperCase() === 'ETH' || tokenSymbol.toUpperCase() === 'ALL') {
      console.log('Fetching internal transactions...');
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
        console.log('No internal transactions found');
      }
    }

    // Fetch transactions for tokens from Firestore based on tokenSymbol or 'All'
    if (tokenSymbol && tokenSymbol.toUpperCase() !== 'ETH') {
      console.log(`Fetching transactions for token: ${tokenSymbol}`);
      const targetTokens = tokenSymbol.toUpperCase() === 'ALL'
        ? Object.keys(tokenAddresses) // Fetch all token addresses if 'All'
        : [tokenSymbol.toUpperCase()]; // Fetch specific token if given

      // Loop through all selected tokens and fetch transactions
      for (const symbol of targetTokens) {
        const tokenAddress = tokenAddresses[symbol];
        if (tokenAddress) {
          const tokenResponse = await axios.get(ETHERSCAN_API_URL, {
            params: {
              module: 'account',
              action: 'tokentx',
              address: walletAddress,
              contractaddress: tokenAddress,
              startblock: 0,
              endblock: 99999999,
              sort: 'asc',
              apikey: ETHERSCAN_API_KEY,
            },
          });

          if (tokenResponse.data.status === '1') {
            tokenTransactions = [
              ...tokenTransactions,
              ...tokenResponse.data.result.map(tx => ({
                ...tx,
                transactionType: symbol, // Use token_name as transaction type
              })),
            ];
          } else {
            console.log(`No transactions found for token: ${symbol}`);
          }
        }
      }
    }

    // Combine all transactions (ETH, Internal, Token)
    const combinedTransactions = [...ethTransactions, ...internalTransactions, ...tokenTransactions];

    if (combinedTransactions.length === 0) {
      console.log('No transactions found overall');
      throw new functions.https.HttpsError('invalid-argument', 'No transactions found');
    }

    console.log('Returning combined transactions:', combinedTransactions.length);
    
    return combinedTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching transactions', error);
  }
});
