import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config'; // Adjust this according to your Firebase config export


const AdminDashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [wallets, setWallets] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [isWalletMode, setIsWalletMode] = useState(true); // Toggle between wallet and token modes
  const [viewWallets, setViewWallets] = useState(true); // Toggle between viewing wallets or tokens
  const [walletNetwork, setWalletNetwork] = useState('ETH');
  const [tokenNetwork, setTokenNetwork] = useState('ETH');

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
    const response = await addWalletAddress({ 
      address: walletAddress, 
      walletName, 
      network: walletNetwork 
    });
    if (response.data.success) {
      fetchWallets();
      setWalletAddress('');
      setWalletName('');
      setViewWallets(true);
    } else {
      console.error(response.data.message);
    }
  };

  const handleAddToken = async () => {
    const addTokenAddress = httpsCallable(functions, 'addTokenAddress');
    const response = await addTokenAddress({ 
      address: tokenAddress, 
      tokenName, 
      network: tokenNetwork 
    });
    if (response.data.success) {
      fetchTokens();
      setTokenAddress('');
      setTokenName('');
      setViewWallets(false);
    } else {
      console.error(response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-6">Admin Dashboard</h2>
        
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 
              ${isWalletMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsWalletMode(true)}
          >
            Wallet Addresses
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 
              ${!isWalletMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsWalletMode(false)}
          >
            Token Addresses
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {isWalletMode ? (
            <>
              <select 
                value={walletNetwork} 
                onChange={(e) => setWalletNetwork(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ETH">Ethereum</option>
                <option value="TRON">Tron</option>
              </select>
              <input 
                type="text" 
                placeholder="Enter wallet address" 
                value={walletAddress} 
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Enter wallet name" 
                value={walletName} 
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleAddWallet}
                className="w-full py-2 bg-blue-600 text-white rounded-md 
                  hover:bg-blue-700 transition-colors duration-200"
              >
                Add New Wallet
              </button>
            </>
          ) : (
            <>
              <select 
                value={tokenNetwork} 
                onChange={(e) => setTokenNetwork(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ETH">Ethereum</option>
                <option value="TRON">Tron</option>
              </select>
              <input 
                type="text" 
                placeholder="Enter token address" 
                value={tokenAddress} 
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Enter token name" 
                value={tokenName} 
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md 
                  text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleAddToken}
                className="w-full py-2 bg-blue-600 text-white rounded-md 
                  hover:bg-blue-700 transition-colors duration-200"
              >
                Add New Token
              </button>
            </>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">
            {viewWallets ? 'Existing Wallet Records' : 'Existing Token Records'}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-gray-200">
                    {viewWallets ? 'Wallet Address' : 'Token Address'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-200">
                    {viewWallets ? 'Wallet Name' : 'Token Name'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(viewWallets ? wallets : tokens).map((item) => (
                  <tr 
                    key={item.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-gray-300">{item.address}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {viewWallets ? item.wallet_name : item.token_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
