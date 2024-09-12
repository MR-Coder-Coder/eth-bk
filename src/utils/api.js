import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config'; // Ensure the path to config is correct

export async function fetchTransactions(walletAddress, tokenSymbol) {
  const fetchTransactions = httpsCallable(functions, 'fetchTransactions');
  const filterTransactions = httpsCallable(functions, 'filterTransactions'); // Call the filtering Cloud Function here
  
  try {
    // Step 1: Fetch transactions from the backend
    const result = await fetchTransactions({ walletAddress, tokenSymbol });
    const transactions = result.data;

    // Step 2: Filter the transactions using the filtering Cloud Function
    const filteredResult = await filterTransactions({ transactions });

    // Step 3: Return the filtered transactions
    return filteredResult.data.transactions;
  } catch (error) {
    console.error('Error fetching or filtering transactions:', error);
    throw error;
  }
}
