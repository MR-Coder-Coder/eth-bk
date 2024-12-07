import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WalletSummary({ transactions, walletAddress, network }) {
  const navigate = useNavigate();
  const [expandedAddresses, setExpandedAddresses] = useState([]);

  const toggleExpand = (address) => {
    setExpandedAddresses(prev => 
      prev.includes(address) 
        ? prev.filter(a => a !== address)
        : [...prev, address]
    );
  };

  const generateWalletSummary = () => {
    const walletSummary = {};

    transactions.forEach(tx => {
      const direction = tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'Out' : 'In';
      const counterpartyAddress = direction === 'Out' ? tx.to.toLowerCase() : tx.from.toLowerCase();
      
      // Initialize the counterparty address in our summary if it doesn't exist
      if (!walletSummary[counterpartyAddress]) {
        walletSummary[counterpartyAddress] = {
          address: counterpartyAddress,
          totalTransactions: 0,
          tokens: {
            // Initialize based on network
            ...(network === 'ETH' ? {
              ETH: { sent: 0, received: 0 },
              USDT: { sent: 0, received: 0 },
              USDC: { sent: 0, received: 0 }
            } : {
              TRX: { sent: 0, received: 0 },
              USDT: { sent: 0, received: 0 },
              USDC: { sent: 0, received: 0 }
            })
          }
        };
      }

      // Convert the value based on token type and network
      let adjustedValue = tx.value;
      if (network === 'ETH') {
        if (tx.transactionType === 'ETH') {
          adjustedValue = parseFloat(tx.value) / 1e18;
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          adjustedValue = parseFloat(tx.value) / 1e6;
        }
      } else if (network === 'TRON') {
        if (tx.transactionType === 'TRX') {
          adjustedValue = parseFloat(tx.value) / 1e6; // TRX uses 6 decimals
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          adjustedValue = parseFloat(tx.value) / 1e6;
        }
      }

      // Update the summary
      walletSummary[counterpartyAddress].totalTransactions++;
      if (direction === 'Out') {
        walletSummary[counterpartyAddress].tokens[tx.transactionType].sent += adjustedValue;
      } else {
        walletSummary[counterpartyAddress].tokens[tx.transactionType].received += adjustedValue;
      }
    });

    // Convert to array and sort by total transaction count
    return Object.values(walletSummary)
      .sort((a, b) => b.totalTransactions - a.totalTransactions);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
        <button 
          className="mb-4 px-4 py-2 bg-blue-600 text-gray-100 rounded-md 
            hover:bg-blue-700 transition-colors duration-200"
          onClick={() => navigate('/results')}
        >
          Back to Transactions
        </button>

        <div className="text-gray-300 text-lg mb-6">
          Network: {network}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-3 text-left text-gray-200">Address</th>
                <th className="px-4 py-3 text-left text-gray-200">Total Transactions</th>
              </tr>
            </thead>
            <tbody>
              {generateWalletSummary().map((summary) => (
                <React.Fragment key={summary.address}>
                  <tr 
                    onClick={() => toggleExpand(summary.address)}
                    className="border-b border-gray-700 hover:bg-gray-700/50 
                      cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="transform transition-transform duration-200">
                          {expandedAddresses.includes(summary.address) ? '▼' : '▶'}
                        </span>
                        <span className="break-all">{summary.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{summary.totalTransactions}</td>
                  </tr>
                  {expandedAddresses.includes(summary.address) && (
                    <tr className="bg-gray-700/50">
                      <td colSpan="2" className="px-4 py-3">
                        <div className="space-y-4">
                          {Object.entries(summary.tokens).map(([token, amounts]) => {
                            if (amounts.sent === 0 && amounts.received === 0) return null;
                            
                            const netAmount = amounts.received - amounts.sent;
                            return (
                              <div key={token} className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-gray-200 font-semibold mb-2">{token}</h4>
                                <div className="space-y-1 text-gray-300">
                                  <p>Sent: {amounts.sent.toFixed(6)}</p>
                                  <p>Received: {amounts.received.toFixed(6)}</p>
                                  <p className={`font-semibold ${
                                    netAmount > 0 ? 'text-green-400' : 
                                    netAmount < 0 ? 'text-red-400' : 'text-gray-300'
                                  }`}>
                                    Net: {netAmount.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WalletSummary;