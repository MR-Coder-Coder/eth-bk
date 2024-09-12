import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import WalletForm from './components/WalletForm';
import TransactionList from './components/TransactionList';
import BalanceDisplay from './components/BalanceDisplay';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard'; // Import the new AdminDashboard component
import { fetchTransactions } from './utils/api'; // Use the updated fetchTransactions function
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './App.css';

const db = getFirestore(); // Initialize Firestore

function MainContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // New state for user role
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'user', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set user role from Firestore
        }
      } else {
        setUser(null);
        setUserRole(null); // Reset role if no user
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (address, token) => {
    setWalletAddress(address);
    setTokenSymbol(token);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions(address, token);
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
            <Navigate to="/login" />
          )
        } />
        {/* Admin route with role-based access */}
        <Route path="/admin" element={
          user && userRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" /> // Redirect to login or another page if not admin
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
