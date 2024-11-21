import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import './ResultsPage.css'; // Ensure you adjust CSS as needed

function ResultsPage({ transactions, walletAddress }) {
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate(); // Add this hook

  const headers = [
    { label: 'Type', key: 'transactionType' },
    { label: 'Block', key: 'blockNumber' },
    { label: 'Time', key: 'humanReadableTime' },
    { label: 'Direction', key: 'direction' },
    { label: 'Value', key: 'adjustedValue' },
    { label: 'ETH Balance', key: 'ethBalance' },
    { label: 'USDT Balance', key: 'usdtBalance' },
    { label: 'USDC Balance', key: 'usdcBalance' },
    { label: 'Gas', key: 'gas' },
  ];

  const CSVheaders = [
    { label: 'Type', key: 'transactionType' },
    { label: 'Block', key: 'blockNumber' },
    { label: 'Time', key: 'humanReadableTime' },
    { label: 'Direction', key: 'direction' },
    { label: 'Hash', key: 'hash' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' },
    { label: 'Value', key: 'adjustedValue' },
    { label: 'ETH Balance', key: 'ethBalance' },
    { label: 'USDT Balance', key: 'usdtBalance' },
    { label: 'USDC Balance', key: 'usdcBalance' },
    { label: 'Gas', key: 'gas' },
    { label: 'Gas Price', key: 'gasPrice' },
    { label: 'Gas Used', key: 'gasUsed' },
  ];

  const toggleRowExpansion = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Initialize balances
  let ethBalance = 0;
  let usdtBalance = 0;
  let usdcBalance = 0;

  const transactionsWithAdditionalInfo = transactions
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .map((tx) => {
      const direction = tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'Out' : 'In';

      // Convert the transaction value based on the token type
      let adjustedValue = tx.value;
      if (tx.transactionType === 'ETH') {
        adjustedValue = parseFloat(tx.value) / 1e18; // Convert Wei to Ether
      } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
        adjustedValue = parseFloat(tx.value) / 1e6; // Convert smallest unit to token value
      }

      // Update balances
      if (tx.transactionType === 'ETH') {
        if (direction === 'In') {
          ethBalance += adjustedValue;
        } else {
          ethBalance -= adjustedValue;
        }
      } else if (tx.transactionType === 'USDT') {
        if (direction === 'In') {
          usdtBalance += adjustedValue;
        } else {
          usdtBalance -= adjustedValue;
        }
      } else if (tx.transactionType === 'USDC') {
        if (direction === 'In') {
          usdcBalance += adjustedValue;
        } else {
          usdcBalance -= adjustedValue;
        }
      }

      return {
        ...tx,
        humanReadableTime: new Date(tx.timeStamp * 1000).toLocaleString(),
        direction,
        adjustedValue: adjustedValue.toFixed(6),
        ethBalance: ethBalance.toFixed(6),
        usdtBalance: usdtBalance.toFixed(2),
        usdcBalance: usdcBalance.toFixed(2),
      };
    });

  return (
    <div id="results-container">
      <div className="ResultsPage full-screen">
        <button 
          className="toggle-summary-btn"
          onClick={() => navigate('/summary')} // Use navigation instead of state
        >
          View Transaction Summary
        </button>

        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/">Home</Link>
        </div>
        <CSVLink
          data={transactionsWithAdditionalInfo}
          headers={CSVheaders}
          filename="transactions.csv"
          className="CSVLink"
        >
          Download CSV
        </CSVLink>
        <table className="transaction-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactionsWithAdditionalInfo.map((tx, index) => (
              <React.Fragment key={index}>
                <tr onClick={() => toggleRowExpansion(index)}>
                  <td>{tx.transactionType}</td>
                  <td>{tx.blockNumber}</td>
                  <td>{tx.humanReadableTime}</td>
                  <td>{tx.direction}</td>
                  <td>{tx.adjustedValue}</td>
                  <td>{tx.ethBalance}</td>
                  <td>{tx.usdtBalance}</td>
                  <td>{tx.usdcBalance}</td>
                  <td>{tx.gas}</td>
                </tr>
                {expandedRows.includes(index) && (
                  <tr className="transaction-details">
                    <td colSpan={9}>
                      <div>
                        <p>
                          <strong>Hash:</strong> {tx.hash}
                        </p>
                        <p>
                          <strong>From:</strong> {tx.from}
                        </p>
                        <p>
                          <strong>To:</strong> {tx.to}
                        </p>
                        <p>
                          <strong>Value:</strong> {tx.adjustedValue}
                        </p>
                        <p>
                          <strong>Time:</strong> {tx.humanReadableTime}
                        </p>
                        <p>
                          <strong>Gas Price:</strong> {tx.gasPrice}
                        </p>
                        <p>
                          <strong>Gas Used:</strong> {tx.gasUsed}
                        </p>
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

export default ResultsPage;
