import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import WalletForm from './components/WalletForm';
import TransactionList from './components/TransactionList';
import BalanceDisplay from './components/BalanceDisplay';
import LoginPage from './components/LoginPage';  // Import LoginPage
import { fetchTransactions } from './utils/api';
import { auth } from './firebase/config';  // Add Firebase auth import
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Track authenticated user

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (address) => {
    setWalletAddress(address);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions(address);
      setTransactions(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />  {/* Add Login Route */}
          <Route path="/" element={
            user ? (  // If user is logged in, show the main content
              <>
                <WalletForm onSubmit={handleSubmit} />
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {transactions.length > 0 && (
                  <>
                    <BalanceDisplay transactions={transactions} walletAddress={walletAddress} />
                    <TransactionList transactions={transactions} walletAddress={walletAddress} />
                  </>
                )}
              </>
            ) : (
              <p>Please log in to view your transactions.</p>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
