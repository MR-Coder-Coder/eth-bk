import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WalletSummary.css';

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
    <div className="summary-container">
      <button 
        className="back-btn"
        onClick={() => navigate('/results')}
      >
        Back to Transactions
      </button>

      <div className="network-indicator">
        Network: {network}
      </div>

      <div className="summary-table-container">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Total Transactions</th>
            </tr>
          </thead>
          <tbody>
            {generateWalletSummary().map((summary) => (
              <React.Fragment key={summary.address}>
                <tr 
                  onClick={() => toggleExpand(summary.address)}
                  className={`summary-row ${expandedAddresses.includes(summary.address) ? 'expanded' : ''}`}
                >
                  <td>
                    <div className="expand-icon">
                      {expandedAddresses.includes(summary.address) ? '▼' : '▶'}
                    </div>
                    {summary.address}
                  </td>
                  <td>{summary.totalTransactions}</td>
                </tr>
                {expandedAddresses.includes(summary.address) && (
                  <tr className="token-details-row">
                    <td colSpan="2">
                      <div className="token-details">
                        {Object.entries(summary.tokens).map(([token, amounts]) => {
                          // Only show tokens that have transactions
                          if (amounts.sent === 0 && amounts.received === 0) return null;
                          
                          const netAmount = amounts.received - amounts.sent;
                          return (
                            <div key={token} className="token-summary">
                              <h4>{token}</h4>
                              <div className="token-amounts">
                                <p>Sent: {amounts.sent.toFixed(6)}</p>
                                <p>Received: {amounts.received.toFixed(6)}</p>
                                <p className={`net-amount ${netAmount > 0 ? 'positive' : netAmount < 0 ? 'negative' : ''}`}>
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
  );
}

export default WalletSummary;