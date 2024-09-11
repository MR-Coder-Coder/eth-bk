import React, { useEffect, useState } from 'react';
import './BalanceDisplay.css';

function BalanceDisplay({ transactions, walletAddress }) {
  const [balances, setBalances] = useState({}); // Store balances for all token types

  useEffect(() => {
    const updatedBalances = {};

    transactions.forEach((tx) => {
      const value = parseFloat(tx.value);

      // Determine the conversion factor based on the token type
      let conversionFactor = 1;
      if (tx.transactionType === 'ETH') {
        conversionFactor = 1e18; // Convert Wei to Ether
      } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
        conversionFactor = 1e6; // Convert smallest unit to token value (USDT, USDC)
      }

      const adjustedValue = value / conversionFactor;

      // Ensure we track the balance for each token
      if (!updatedBalances[tx.transactionType]) {
        updatedBalances[tx.transactionType] = 0;
      }

      // Adjust balance based on whether the transaction is incoming or outgoing
      if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
        updatedBalances[tx.transactionType] -= adjustedValue;
      } else if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
        updatedBalances[tx.transactionType] += adjustedValue;
      }
    });

    setBalances(updatedBalances); // Update state with the calculated balances
  }, [transactions, walletAddress]);

  return (
    <div className="BalanceDisplay">
      <h3>Balances</h3>
      {Object.keys(balances).map((tokenType) => (
        <p key={tokenType}>
          {tokenType} Balance: {balances[tokenType].toFixed(6)} {tokenType}
        </p>
      ))}
    </div>
  );
}

export default BalanceDisplay;
