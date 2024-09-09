import React, { useEffect, useState } from 'react';

function BalanceDisplay({ transactions, walletAddress }) {
  const [ethBalance, setEthBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);

  useEffect(() => {
    let ethBalance = 0;
    let usdtBalance = 0;

    transactions.forEach((tx) => {
      const value = parseFloat(tx.value) / 1e18; // Convert value from Wei to Ether
      if (tx.transactionType === 'ETH') {
        if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          ethBalance -= value;
        } else if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
          ethBalance += value;
        }
      } else if (tx.transactionType === 'USDT') {
        const usdtValue = parseFloat(tx.value) / 1e6; // Convert value from smallest unit to USDT
        if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          usdtBalance -= usdtValue;
        } else if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
          usdtBalance += usdtValue;
        }
      }
    });

    setEthBalance(ethBalance);
    setUsdtBalance(usdtBalance);
  }, [transactions, walletAddress]);

  return (
    <div className="BalanceDisplay">
      <h3>Balances</h3>
      <p>ETH Balance: {ethBalance.toFixed(6)} ETH</p>
      <p>USDT Balance: {usdtBalance.toFixed(2)} USDT</p>
    </div>
  );
}

export default BalanceDisplay;
