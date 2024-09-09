import React, { useState } from 'react';

function WalletForm({ onSubmit }) {
  const [walletAddress, setWalletAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(walletAddress);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Enter wallet address"
        required
      />
      <button type="submit">Fetch Transactions</button>
    </form>
  );
}

export default WalletForm;
