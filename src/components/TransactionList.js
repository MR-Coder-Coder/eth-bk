import React from 'react';
import { Link } from 'react-router-dom';
import './TransactionList.css';

function TransactionList({ transactionsAvailable }) {
  return (
    <div className="transaction-box"> {/* Added div with class transaction-box */}
      <div className="TransactionList">
        {transactionsAvailable ? (
          <Link to="/results" className="results-link">
            View Results
          </Link>
        ) : (
          <p>No transactions to display.</p>
        )}
      </div>
    </div>
  );
}

export default TransactionList;
