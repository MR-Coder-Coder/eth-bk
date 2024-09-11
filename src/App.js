import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import WalletForm from './components/WalletForm';
import TransactionList from './components/TransactionList';
import BalanceDisplay from './components/BalanceDisplay';
import LoginPage from './components/LoginPage';
import { fetchTransactions } from './utils/api'; // Import the fetchTransactions function
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

// Main content for the app
function MainContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation(); // Access to location inside the Router

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (address, token) => {
    setWalletAddress(address);
    setTokenSymbol(token);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions(address, token); // Pass both wallet address and token symbol
      setTransactions(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {location.pathname !== '/login' && user && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          user ? (
            <>
              <WalletForm onSubmit={handleSubmit} /> {/* Form to submit wallet address and token */}
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
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
