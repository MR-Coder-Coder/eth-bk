import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import './TransactionList.css';

function TransactionList({ transactions, walletAddress }) {
  const [expandedRows, setExpandedRows] = useState([]); // Track expanded rows

  const headers = [
    { label: 'Type', key: 'transactionType' },
    { label: 'Block', key: 'blockNumber' },
    { label: 'Time', key: 'humanReadableTime' },
    { label: 'Direction', key: 'direction' },
    { label: 'Value', key: 'value' },
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
    { label: 'Value', key: 'value' },
    { label: 'Gas', key: 'gas' },
    { label: 'Gas Price', key: 'gasPrice' },
    { label: 'Gas Used', key: 'gasUsed' },
  ];

  const toggleRowExpansion = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index)); // Collapse
    } else {
      setExpandedRows([...expandedRows, index]); // Expand
    }
  };

  const transactionsWithAdditionalInfo = transactions.map((tx) => {
    const direction = tx.from === walletAddress.toLowerCase() ? 'Out' : 'In';
    return {
      ...tx,
      humanReadableTime: new Date(tx.timeStamp * 1000).toLocaleString(),
      direction,
    };
  });

  return (
    <div className="TransactionList">
      <CSVLink data={transactionsWithAdditionalInfo} headers={CSVheaders} filename="transactions.csv" className="CSVLink">
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
                <td>{tx.value}</td>
                <td>{tx.gas}</td>
              </tr>
              {expandedRows.includes(index) && (
                <tr className="transaction-details">
                  <td colSpan={6}>
                    <div>
                      <p><strong>Hash:</strong> {tx.hash}</p>
                      <p><strong>From:</strong> {tx.from}</p>
                      <p><strong>To:</strong> {tx.to}</p>
                      <p><strong>Value:</strong> {tx.value}</p>
                      <p><strong>Time:</strong> {tx.humanReadableTime}</p>
                      <p><strong>Gas Price:</strong> {tx.gasPrice}</p>
                      <p><strong>Gas Used:</strong> {tx.gasUsed}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
