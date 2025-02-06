import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';


function WalletForm({ onSubmit }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [token, setToken] = useState('');
  const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(true);

  // Available networks
  const networks = [
    { value: 'ETH', label: 'Ethereum' },
    { value: 'TRON', label: 'Tron' }
  ];

  useEffect(() => {
    const fetchWalletsAndTokens = async () => {
      const functions = getFunctions();
      const getWalletAndTokens = httpsCallable(functions, 'getWalletAndTokens');

      try {
        // Fetch both ETH and TRON data
        const ethResponse = await getWalletAndTokens({ network: 'ETH' });
        const tronResponse = await getWalletAndTokens({ network: 'TRON' });

        // Safely handle potentially null or undefined wallet addresses
        const processWallets = (wallets = []) => {
          return wallets.map(wallet => ({
            ...wallet,
            wallet_address: wallet.wallet_address || '',
            wallet_name: wallet.wallet_name || 'Unnamed Wallet'
          }));
        };

        // Combine the data but keep it organized by network
        const combinedData = {
          ETH: {
            wallets: processWallets(ethResponse.data?.wallets),
            tokens: ethResponse.data?.tokens || []
          },
          TRON: {
            wallets: processWallets(tronResponse.data?.wallets),
            tokens: tronResponse.data?.tokens || []
          }
        };

        // Store the combined data
        setWalletAddresses(combinedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet addresses and tokens:', error);
        setLoading(false);
      }
    };

    fetchWalletsAndTokens();
  }, []);

  // Handle network change
  const handleNetworkChange = (e) => {
    const selectedNetwork = e.target.value;
    setNetwork(selectedNetwork);
    setWalletAddress(''); // Reset wallet selection
    setToken(''); // Reset token selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (walletAddress) {  // Only submit if wallet address exists
      onSubmit(walletAddress, token, network);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl text-gray-200 font-semibold">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Get current network's wallets and tokens
  const currentWallets = network ? walletAddresses[network]?.wallets || [] : [];
  const currentTokens = network ? walletAddresses[network]?.tokens || [] : [];

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Network Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="network" className="text-gray-300">
              Network
            </label>
            <select
              id="network"
              value={network}
              onChange={handleNetworkChange}
              required
              className="p-2.5 bg-gray-700 border border-gray-600 rounded-md text-gray-200 w-full 
                focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="" className="bg-gray-700">Select Network</option>
              {networks.map((net) => (
                <option 
                  key={net.value} 
                  value={net.value}
                  className="bg-gray-700"
                >
                  {net.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="walletAddress" className="text-gray-300">
              Wallet
            </label>
            <select
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
              disabled={!network}
              className="p-2.5 bg-gray-700 border border-gray-600 rounded-md text-gray-200 w-full 
                focus:ring-blue-500 focus:border-blue-500 outline-none
                disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-gray-700">Select Wallet</option>
              {currentWallets.map((wallet, index) => (
                <option 
                  key={index} 
                  value={wallet.wallet_address || ''}
                  className="bg-gray-700"
                >
                  {wallet.wallet_name || 'Unnamed Wallet'}
                </option>
              ))}
            </select>
          </div>

          {/* Token Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="token" className="text-gray-300">
              Token
            </label>
            <select
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={!network}
              className="p-2.5 bg-gray-700 border border-gray-600 rounded-md text-gray-200 w-full 
                focus:ring-blue-500 focus:border-blue-500 outline-none
                disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-gray-700">Select Token</option>
              {currentTokens.map((token, index) => (
                <option 
                  key={index} 
                  value={token}
                  className="bg-gray-700"
                >
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md 
            hover:bg-blue-700 transition-colors duration-300
            disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Fetch Transactions
        </button>
      </form>
    </div>
  );
}

export default WalletForm;
