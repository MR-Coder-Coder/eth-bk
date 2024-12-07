import React, { useEffect, useState, useRef } from 'react';


function BalanceDisplay({ transactions, walletAddress, network }) {
  const [balances, setBalances] = useState({});
  const totalGasUsedRef = useRef(0);

  useEffect(() => {
    const updatedBalances = {};
    totalGasUsedRef.current = 0;

    transactions.forEach((tx) => {
      const value = parseFloat(tx.value);

      // Determine the conversion factor based on the token type and network
      let conversionFactor = 1;
      if (network === 'ETH') {
        if (tx.transactionType === 'ETH') {
          conversionFactor = 1e18; // Convert Wei to Ether
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          conversionFactor = 1e6; // Convert smallest unit to token value
        }
      } else if (network === 'TRON') {
        if (tx.transactionType === 'TRX') {
          conversionFactor = 1e6; // Convert Sun to TRX
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          conversionFactor = 1e6; // Convert smallest unit to token value
        }
      }

      const adjustedValue = value / conversionFactor;

      // Initialize token balance if not exists
      if (!updatedBalances[tx.transactionType]) {
        updatedBalances[tx.transactionType] = 0;
      }

      // Adjust balance based on transaction direction
      const fromAddress = tx.from ? tx.from.toLowerCase() : '';
      const toAddress = tx.to ? tx.to.toLowerCase() : '';
      const walletAddr = walletAddress.toLowerCase();

      if (fromAddress === walletAddr) {
        updatedBalances[tx.transactionType] -= adjustedValue;

        // Handle gas calculations based on network
        if (tx.gasPrice && tx.gasUsed) {
          const gasUsed = parseFloat(tx.gasUsed);
          const gasPrice = parseFloat(tx.gasPrice);
          if (network === 'ETH') {
            const gasInEth = (gasUsed * gasPrice) / 1e18;
            totalGasUsedRef.current += gasInEth;
          } else if (network === 'TRON') {
            const gasInTrx = (gasUsed * gasPrice) / 1e6;
            totalGasUsedRef.current += gasInTrx;
          }
        }
      } else if (toAddress === walletAddr) {
        updatedBalances[tx.transactionType] += adjustedValue;
      }
    });

    // Deduct gas from native currency balance (ETH or TRX)
    const nativeCurrency = network === 'ETH' ? 'ETH' : 'TRX';
    if (updatedBalances[nativeCurrency]) {
      updatedBalances[nativeCurrency] -= totalGasUsedRef.current;
    }

    setBalances(updatedBalances);
  }, [transactions, walletAddress, network]);

  return (
    <div className="my-5 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <h3 className="mb-3 text-gray-200 text-xl font-semibold">
        Balances ({network})
      </h3>
      {Object.keys(balances).map((tokenType) => (
        <p key={tokenType} className="text-lg text-gray-300 py-1">
          {tokenType} Balance: {balances[tokenType].toFixed(6)} {tokenType}
        </p>
      ))}
    </div>
  );
}

export default BalanceDisplay;
