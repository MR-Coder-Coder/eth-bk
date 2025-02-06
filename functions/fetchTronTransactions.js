const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const TRONSCAN_API_KEY = process.env.TRONSCAN_API_KEY;
const TRONSCAN_API_URL = 'https://apilist.tronscanapi.com/api/new';

exports.fetchTronTransactions = functions.https.onCall(async (data, context) => {
    const { walletAddress, tokenSymbol } = data;
    const db = admin.firestore();

    try {
        console.log(`Fetching Tron transactions for wallet: ${walletAddress}, Token Symbol: ${tokenSymbol}`);

        let transactions = [];

        // Function to fetch token transactions
        const fetchTokenTransactions = async (contractAddress) => {
            const response = await axios.get(`${TRONSCAN_API_URL}/token_trc20/transfers`, {
                params: {
                    start: 0,
                    limit: 10000,
                    contract_address: contractAddress,
                    address: walletAddress
                },
                headers: {
                    'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
                }
            });
            
            return response.data.token_transfers || [];
        };

        // Function to fetch TRX transactions
        const fetchTrxTransactions = async () => {
            const response = await axios.get(`${TRONSCAN_API_URL}/transfer`, {
                params: {
                    start: 0,
                    limit: 10000,
                    address: walletAddress,
                },
                headers: {
                    'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
                }
            });
            
            return response.data.data || [];
        };

        if (tokenSymbol === 'ALL') {
            // Fetch USDT contract address from database
            const usdtSnapshot = await db
                .collection('tron_token_addresses')
                .where('token_name', '==', 'USDT')
                .limit(1)
                .get();

            if (!usdtSnapshot.empty) {
                const usdtAddress = usdtSnapshot.docs[0].data().address;
                console.log('Found USDT contract address:', usdtAddress);

                // Fetch both TRX and USDT transactions
                const [trxTxs, usdtTxs] = await Promise.all([
                    fetchTrxTransactions(),
                    fetchTokenTransactions(usdtAddress)
                ]);

                // Process TRX transactions
                const processedTrxTxs = trxTxs.map(tx => ({
                    transactionType: 'TRX',
                    from: tx.transferFromAddress || null,
                    to: tx.transferToAddress || null,
                    value: parseFloat(tx.amount || 0) / Math.pow(10, 6),
                    hash: tx.transactionHash || null,
                    timeStamp: Math.floor(tx.timestamp / 1000),
                    blockNumber: tx.block || null,
                    tokenSymbol: 'TRX',
                    tokenAddress: null,
                    contractRet: tx.contractRet || null,
                    confirmed: tx.confirmed || false
                }));

                // Process USDT transactions
                const processedUsdtTxs = usdtTxs.map(tx => ({
                    transactionType: 'USDT',
                    from: tx.from_address || null,
                    to: tx.to_address || null,
                    value: parseFloat(tx.quant || 0) / Math.pow(10, 6),
                    hash: tx.transaction_id || null,
                    timeStamp: Math.floor(tx.block_ts / 1000),
                    blockNumber: tx.block || null,
                    tokenSymbol: 'USDT',
                    tokenAddress: usdtAddress,
                    contractRet: tx.contractRet || null,
                    confirmed: tx.confirmed || false
                }));

                transactions = [...processedTrxTxs, ...processedUsdtTxs];
            }
        } else if (tokenSymbol === 'TRX') {
            const trxTxs = await fetchTrxTransactions();
            transactions = trxTxs.map(tx => ({
                transactionType: 'TRX',
                from: tx.transferFromAddress || null,
                to: tx.transferToAddress || null,
                value: parseFloat(tx.amount || 0) / Math.pow(10, 6),
                hash: tx.transactionHash || null,
                timeStamp: Math.floor(tx.timestamp / 1000),
                blockNumber: tx.block || null,
                tokenSymbol: 'TRX',
                tokenAddress: null,
                contractRet: tx.contractRet || null,
                confirmed: tx.confirmed || false
            }));
        } else if (tokenSymbol === 'USDT') {
            // Specific handling for USDT transactions
            const usdtSnapshot = await db
                .collection('tron_token_addresses')
                .where('token_name', '==', 'USDT')
                .limit(1)
                .get();

            if (!usdtSnapshot.empty) {
                const usdtAddress = usdtSnapshot.docs[0].data().address;
                console.log('Found USDT contract address:', usdtAddress);

                const usdtTxs = await fetchTokenTransactions(usdtAddress);
                transactions = usdtTxs.map(tx => ({
                    transactionType: 'USDT',
                    from: tx.from_address || null,
                    to: tx.to_address || null,
                    value: parseFloat(tx.quant || 0) / Math.pow(10, 6),
                    hash: tx.transaction_id || null,
                    timeStamp: Math.floor(tx.block_ts / 1000),
                    blockNumber: tx.block || null,
                    tokenSymbol: 'USDT',
                    tokenAddress: usdtAddress,
                    contractRet: tx.contractRet || null,
                    confirmed: tx.confirmed || false
                }));
            } else {
                throw new functions.https.HttpsError(
                    'not-found',
                    'USDT contract address not found in database'
                );
            }
        } else {
            // Handle other tokens
            const tokenSnapshot = await db
                .collection('tron_token_addresses')
                .where('token_name', '==', tokenSymbol)
                .limit(1)
                .get();

            if (!tokenSnapshot.empty) {
                const tokenAddress = tokenSnapshot.docs[0].data().address;
                console.log(`Found ${tokenSymbol} contract address:`, tokenAddress);

                const tokenTxs = await fetchTokenTransactions(tokenAddress);
                transactions = tokenTxs.map(tx => ({
                    transactionType: tokenSymbol,
                    from: tx.from_address || null,
                    to: tx.to_address || null,
                    value: parseFloat(tx.quant || 0) / Math.pow(10, 6),
                    hash: tx.transaction_id || null,
                    timeStamp: Math.floor(tx.block_ts / 1000),
                    blockNumber: tx.block || null,
                    tokenSymbol: tokenSymbol,
                    tokenAddress: tokenAddress,
                    contractRet: tx.contractRet || null,
                    confirmed: tx.confirmed || false
                }));
            } else {
                throw new functions.https.HttpsError(
                    'not-found',
                    `No address found for token_name: ${tokenSymbol}`
                );
            }
        }

        // Sort all transactions by timestamp (newest first)
        transactions.sort((a, b) => b.timeStamp - a.timeStamp);

        if (transactions.length === 0) {
            console.log('No transactions found');
            throw new functions.https.HttpsError('not-found', 'No transactions found.');
        }

        console.log(`Returning ${transactions.length} transactions.`);
        return { transactions };

    } catch (error) {
        console.error('Error fetching Tron transactions:', error.message);
        throw new functions.https.HttpsError('internal', 'Error fetching Tron transactions.', { details: error.message });
    }
});