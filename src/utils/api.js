import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export async function fetchTransactions(walletAddress, tokenSymbol, network) {
  // Choose the appropriate Cloud Function based on network
  const functionName = network.toUpperCase() === 'TRON' ? 'fetchTronTransactions' : 'fetchTransactions';
  const fetchTransactionsFunc = httpsCallable(functions, functionName);
  const filterTransactions = httpsCallable(functions, 'filterTransactions');
  
  try {
    // Step 1: Fetch transactions using the appropriate function
    const result = await fetchTransactionsFunc({ walletAddress, tokenSymbol, network });
    
    // Handle different response structures between ETH and TRON
    const transactions = network.toUpperCase() === 'TRON' ? result.data.transactions : result.data;

    // Step 2: Filter the transactions
    const filteredResult = await filterTransactions({ transactions, network });

    // Step 3: Return the filtered transactions
    return filteredResult.data.transactions;
  } catch (error) {
    console.error('Error fetching or filtering transactions:', error);
    throw error;
  }
}
