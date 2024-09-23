import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Header from './components/Header';
import WalletForm from './components/WalletForm';
import TransactionList from './components/TransactionList';
import ResultsPage from './components/ResultsPage'; // Import the new ResultsPage component
import BalanceDisplay from './components/BalanceDisplay';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { fetchTransactions } from './utils/api';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './App.css';

const db = getFirestore();

function MainContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate to programmatically navigate

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'user', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
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
      setLoading(false);
      // Navigate to results page after fetching transactions
      navigate('/results');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isResultsPage = location.pathname === '/results'; // Check if the current page is the ResultsPage
  const isLoginPage = location.pathname === '/login'; // Check if the current page is the LoginPage

  return (
    <div className={isResultsPage || isLoginPage ? '' : 'main-container'}>
      {/* Apply global styles only to components except the ResultsPage and LoginPage */}
      {!isLoginPage && !isResultsPage && user && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            user ? (
              <>
                <WalletForm onSubmit={handleSubmit} />
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {transactions.length > 0 && (
                  <>
                    <TransactionList transactionsAvailable={true} />
                  </>
                )}
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Add the ResultsPage route */}
        <Route
          path="/results"
          element={
            user ? (
              <>
                {/* Display BalanceDisplay on top of ResultsPage */}
                <BalanceDisplay
                  transactions={transactions}
                  walletAddress={walletAddress}
                />
                <ResultsPage
                  transactions={transactions}
                  walletAddress={walletAddress}
                />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Admin route with role-based access */}
        <Route
          path="/admin"
          element={
            user && userRole === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
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
