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
        console.log(`Fetching Tron transactions for wallet: ${walletAddress}, Token Symbol: ${tokenSymbol}`);

        let trxTransactions = [];
        let trc20Transactions = [];
        let tokenAddress = null;

        // Fetch token address from Firestore based on token_name
        if (tokenSymbol !== 'ALL' && tokenSymbol !== 'TRX') {
            const tokenSnapshot = await db
                .collection('tron_token_addresses')
                .where('token_name', '==', tokenSymbol)
                .limit(1)
                .get();

            if (!tokenSnapshot.empty) {
                tokenAddress = tokenSnapshot.docs[0].data().address;
                console.log(`Found token address for ${tokenSymbol}: ${tokenAddress}`);
            } else {
                throw new functions.https.HttpsError(
                    'not-found',
                    `No address found for token_name: ${tokenSymbol}`
                );
            }
        }

        // Fetch TRX transactions with limit
        if (tokenSymbol === 'ALL' || tokenSymbol === 'TRX') {
            console.log('Fetching TRX transactions...');
            const trxResponse = await axios.get(`${TRONSCAN_API_URL}/transfer/trx`, {
                params: {
                    address: walletAddress,
                    sort: '-timestamp',
                    limit: 10000,
                    start: 0,
                    direction: 0,
                    reverse: true,
                    fee: true,
                    db_version: 1
                },
                headers: {
                    'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
                },
            });

            if (trxResponse.data?.data?.length > 0) {
                trxTransactions = trxResponse.data.data.map(tx => ({
                    transactionType: 'TRX',
                    from: tx.from || null,
                    to: tx.to || null,
                    value: parseFloat(tx.amount || 0),
                    hash: tx.hash || null,
                    timeStamp: Math.floor(tx.block_timestamp / 1000),
                }));
            }
        }

        // Fetch TRC20 transactions with limit
        if (tokenSymbol === 'ALL' || tokenSymbol === 'USDT') {
            console.log('Fetching TRC20 transactions...');
            const trc20Response = await axios.get(`${TRONSCAN_API_URL}/transfer/trc20`, {
                params: {
                    address: walletAddress,
                    trc20Id: tokenAddress, // Using the token address from Firestore
                    start: 0,
                    limit: 10000,
                    direction: 0,
                    reverse: true,
                    db_version: 1
                },
                headers: {
                    'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
                },
            });

            if (trc20Response.data?.data) {
                trc20Transactions = trc20Response.data.data.map(tx => {
                    const decimals = tx.tokenInfo?.decimals || 6; // USDT uses 6 decimals
                    const value = parseFloat(tx.amount || 0) / Math.pow(10, decimals);
                    return {
                        transactionType: 'USDT',
                        from: tx.from || null,
                        to: tx.to || null,
                        value: isNaN(value) ? 0 : value,
                        hash: tx.transactionHash || null,
                        timeStamp: Math.floor(tx.block_timestamp / 1000),
                        tokenSymbol: 'USDT',
                        tokenAddress: tokenAddress
                    };
                });
            }
        }

        // Combine TRX and TRC20 transactions
        let combinedTransactions = [];
        if (tokenSymbol === 'ALL') {
            combinedTransactions = [...trxTransactions, ...trc20Transactions];
        } else if (tokenSymbol === 'TRX') {
            combinedTransactions = trxTransactions;
        } else {
            combinedTransactions = trc20Transactions;
        }

        // Sort combined transactions by timestamp (newest first)
        combinedTransactions.sort((a, b) => b.timeStamp - a.timeStamp);

        if (combinedTransactions.length === 0) {
            console.log('No transactions found in combined results');
            throw new functions.https.HttpsError('not-found', 'No transactions found.');
        }

        console.log(`Returning ${combinedTransactions.length} transactions.`);
        return { transactions: combinedTransactions };

    } catch (error) {
        console.error('Error fetching Tron transactions:', error.message);
        throw new functions.https.HttpsError('internal', 'Error fetching Tron transactions.', { details: error.message });
    }
});