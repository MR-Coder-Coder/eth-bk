import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom'; // Add Navigate for redirection
import Header from './components/Header';
import WalletForm from './components/WalletForm';
import TransactionList from './components/TransactionList';
import BalanceDisplay from './components/BalanceDisplay';
import LoginPage from './components/LoginPage';
import { fetchTransactions } from './utils/api';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

// Create a wrapper component for the routes
function MainContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation(); // useLocation can be used safely here inside the Router

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
    <div className="App">
      {/* Only show Header if the current route is NOT login */}
      {location.pathname !== '/login' && user && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
            // If user is not logged in, redirect to the login page
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
      <MainContent /> {/* Main content with location and routes */}
    </Router>
  );
}

export default App;
