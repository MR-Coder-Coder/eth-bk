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
import WalletSummary from './components/WalletSummary';
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
  const [network, setNetwork] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSubmit = async (address, token, selectedNetwork) => {
    setWalletAddress(address);
    setTokenSymbol(token);
    setNetwork(selectedNetwork);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions(address, token, selectedNetwork);
      setTransactions(result);
      setLoading(false);
      navigate('/results');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isResultsPage = location.pathname === '/results'; // Check if the current page is the ResultsPage
  const isLoginPage = location.pathname === '/login'; // Check if the current page is the LoginPage
  const isSummaryPage = location.pathname === '/summary'; // Check if the current page is the SummaryPage

  return (
    <div className={isResultsPage || isLoginPage ? '' : 'main-container'}>
      {!isLoginPage && !isResultsPage && !isSummaryPage && user && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            user ? (
              <>
                <WalletForm onSubmit={handleSubmit} />
                {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xl text-gray-200 font-semibold">
                      Loading...
                    </span>
                  </div>
                </div>)}
                {error && <p className="error">{error}</p>}
                {transactions.length > 0 && (
                  <>
                    <TransactionList transactionsAvailable={true} network={network} />
                  </>
                )}
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/results"
          element={
            user ? (
              <>
                <BalanceDisplay
                  transactions={transactions}
                  walletAddress={walletAddress}
                  network={network}
                />
                <ResultsPage
                  transactions={transactions}
                  walletAddress={walletAddress}
                  network={network}
                />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
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
        <Route
          path="/summary"
          element={
            <WalletSummary
              transactions={transactions}
              walletAddress={walletAddress}
              network={network}
            />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <MainContent />
      </div>
    </Router>
  );
}

export default App;
