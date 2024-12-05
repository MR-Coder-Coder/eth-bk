import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './WalletForm.css';

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
    return <div>Loading...</div>;
  }

  // Get current network's wallets and tokens
  const currentWallets = network ? walletAddresses[network]?.wallets || [] : [];
  const currentTokens = network ? walletAddresses[network]?.tokens || [] : [];

  return (
    <div className="wallet-box">
      <form className="wallet-form" onSubmit={handleSubmit}>
        <div className="form-group-row">
          {/* Network Selection */}
          <div className="form-group">
            <label htmlFor="network">Network</label>
            <select
              id="network"
              value={network}
              onChange={handleNetworkChange}
              required
            >
              <option value="">Select Network</option>
              {networks.map((net) => (
                <option key={net.value} value={net.value}>
                  {net.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="walletAddress">Wallet</label>
            <select
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
              disabled={!network}
            >
              <option value="">Select Wallet</option>
              {currentWallets.map((wallet, index) => (
                <option key={index} value={wallet.wallet_address || ''}>
                  {wallet.wallet_name || 'Unnamed Wallet'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="token">Token</label>
            <select
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={!network}
            >
              <option value="">Select Token</option>
              {currentTokens.map((token, index) => (
                <option key={index} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="submit-btn" type="submit">Fetch Transactions</button>
      </form>
    </div>
  );
}

export default WalletForm;
