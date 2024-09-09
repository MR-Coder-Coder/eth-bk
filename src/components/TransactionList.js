import React from 'react';
import { CSVLink } from 'react-csv';

function TransactionList({ transactions, walletAddress }) {
  const headers = [
    { label: 'Transaction Type', key: 'transactionType' },
    { label: 'Block Number', key: 'blockNumber' },
    { label: 'Timestamp', key: 'timeStamp' },
    { label: 'Human Readable Time', key: 'humanReadableTime' },
    { label: 'Direction', key: 'direction' },
    { label: 'Hash', key: 'hash' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' },
    { label: 'Value', key: 'value' },
    { label: 'Gas', key: 'gas' },
    { label: 'Gas Price', key: 'gasPrice' },
    { label: 'Gas Used', key: 'gasUsed' },
  ];

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
      <CSVLink data={transactionsWithAdditionalInfo} headers={headers} filename="transactions.csv" className="CSVLink">
        Download CSV
      </CSVLink>
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.key}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactionsWithAdditionalInfo.map((tx, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header.key}>{tx[header.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
