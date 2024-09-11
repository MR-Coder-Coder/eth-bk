import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config'; // Adjust this according to your Firebase config export
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [wallets, setWallets] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [isWalletMode, setIsWalletMode] = useState(true); // Toggle between wallet and token modes
  const [viewWallets, setViewWallets] = useState(true); // Toggle between viewing wallets or tokens

  const functions = getFunctions(app); // Initialize Firebase functions

  useEffect(() => {
    fetchWallets();
    fetchTokens();
  }, []); // Add the functions here as dependencies

  const fetchWallets = async () => {
    const getWalletAddresses = httpsCallable(functions, 'getWalletAddresses');
    const response = await getWalletAddresses();
    setWallets(response.data);
  };

  const fetchTokens = async () => {
    const getTokenAddresses = httpsCallable(functions, 'getTokenAddresses');
    const response = await getTokenAddresses();
    setTokens(response.data);
  };

  const handleAddWallet = async () => {
    const addWalletAddress = httpsCallable(functions, 'addWalletAddress');
    const response = await addWalletAddress({ address: walletAddress, walletName });
    if (response.data.success) {
      fetchWallets();
      setWalletAddress('');
      setWalletName('');
      setViewWallets(true); // Switch to viewing wallets after adding
    } else {
      console.error(response.data.message);
    }
  };

  const handleAddToken = async () => {
    const addTokenAddress = httpsCallable(functions, 'addTokenAddress');
    const response = await addTokenAddress({ address: tokenAddress, tokenName });
    if (response.data.success) {
      fetchTokens();
      setTokenAddress('');
      setTokenName('');
      setViewWallets(false); // Switch to viewing tokens after adding
    } else {
      console.error(response.data.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {/* Tabs to toggle between adding wallets and tokens */}
      <div className="tabs">
        <button
          className={isWalletMode ? 'active' : ''}
          onClick={() => setIsWalletMode(true)}
        >
          Wallet Addresses
        </button>
        <button
          className={!isWalletMode ? 'active' : ''}
          onClick={() => setIsWalletMode(false)}
        >
          Token Addresses
        </button>
      </div>

      {/* Add form, switches between wallet and token inputs */}
      <div className="form">
        {isWalletMode ? (
          <>
            <input 
              type="text" 
              placeholder="Enter wallet address" 
              value={walletAddress} 
              onChange={(e) => setWalletAddress(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Enter wallet name" 
              value={walletName} 
              onChange={(e) => setWalletName(e.target.value)} 
            />
            <button onClick={handleAddWallet}>Add New Wallet</button>
          </>
        ) : (
          <>
            <input 
              type="text" 
              placeholder="Enter token address" 
              value={tokenAddress} 
              onChange={(e) => setTokenAddress(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Enter token name" 
              value={tokenName} 
              onChange={(e) => setTokenName(e.target.value)} 
            />
            <button onClick={handleAddToken}>Add New Token</button>
          </>
        )}
      </div>

      {/* Existing records header */}
      <div className="records-header">
        <h3>{viewWallets ? 'Existing Wallet Records' : 'Existing Token Records'}</h3>
      </div>

      {/* Toggle between viewing wallet and token records */}
      <div className="tabs">
        <button
          className={viewWallets ? 'active' : ''}
          onClick={() => setViewWallets(true)}
        >
          View Wallet Records
        </button>
        <button
          className={!viewWallets ? 'active' : ''}
          onClick={() => setViewWallets(false)}
        >
          View Token Records
        </button>
      </div>

      {/* Display existing records */}
      {viewWallets ? (
        <div className="records">
          <table>
            <thead>
              <tr>
                <th>Wallet Address</th>
                <th>Wallet Name</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>{wallet.address}</td>
                  <td>{wallet.wallet_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="records">
          <table>
            <thead>
              <tr>
                <th>Token Address</th>
                <th>Token Name</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td>{token.address}</td>
                  <td>{token.token_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
