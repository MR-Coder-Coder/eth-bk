import React from 'react';
import { Link } from 'react-router-dom';

function TransactionList({ transactionsAvailable }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
      <div className="text-center">
        {transactionsAvailable ? (
          <Link 
            to="/results" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold 
              rounded-md hover:bg-blue-700 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-gray-800"
          >
            View Results
          </Link>
        ) : (
          <p className="text-lg text-gray-300">No transactions to display.</p>
        )}
      </div>
    </div>
  );
}

export default TransactionList;
