import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './WalletForm.css';

function WalletForm({ onSubmit }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [token, setToken] = useState('');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletsAndTokens = async () => {
      const functions = getFunctions();
      const getWalletAndTokens = httpsCallable(functions, 'getWalletAndTokens');

      try {
        const response = await getWalletAndTokens();
        setWalletAddresses(response.data.wallets);
        setTokens(response.data.tokens);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet addresses and tokens:', error);
        setLoading(false);
      }
    };

    fetchWalletsAndTokens();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(walletAddress, token); // Pass wallet address and token to the App.js
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-box"> {/* Added div with class wallet-box */}
      <form className="wallet-form" onSubmit={handleSubmit}>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="walletAddress">Wallet</label>
            <select
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
            >
              <option value="">Select Wallet</option>
              {walletAddresses.map((wallet, index) => (
                <option key={index} value={wallet.wallet_address}>
                  {wallet.wallet_name}
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
            >
              <option value="">Select Token</option>
              {tokens.map((token, index) => (
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
