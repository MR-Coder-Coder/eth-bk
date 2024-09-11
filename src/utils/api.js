// src/utils/api.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config'; // Ensure the path to config is correct

export async function fetchTransactions(walletAddress, tokenSymbol) {
  const fetchTransactions = httpsCallable(functions, 'fetchTransactions');
  try {
    const result = await fetchTransactions({ walletAddress, tokenSymbol }); // Pass both walletAddress and tokenSymbol
    return result.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
