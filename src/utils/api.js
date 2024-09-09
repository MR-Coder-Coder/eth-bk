// src/utils/api.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config'; // Make sure the path is correct

export async function fetchTransactions(walletAddress) {
  const fetchTransactions = httpsCallable(functions, 'fetchTransactions');
  try {
    const result = await fetchTransactions({ walletAddress });
    return result.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
