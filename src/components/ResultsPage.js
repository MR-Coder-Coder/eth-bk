import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config'; // Make sure this import exists

function ResultsPage({ transactions, walletAddress, network }) {
  const [expandedRows, setExpandedRows] = useState([]);
  const [knownWallets, setKnownWallets] = useState({});
  const navigate = useNavigate();

  // Fetch known wallets on component mount
  useEffect(() => {
    const fetchKnownWallets = async () => {
      const walletsSnapshot = await getDocs(collection(db, 'eth_known_wallets'));
      const walletsMap = {};
      walletsSnapshot.forEach(doc => {
        const data = doc.data();
        walletsMap[data.wallet_address.toLowerCase()] = {
          sage_name: data.sage_name,
          sage_nc: data.sage_nc
        };
      });
      setKnownWallets(walletsMap);
    };
    fetchKnownWallets();
  }, []);

  // Dynamic headers based on network
  const headers = [
    { label: 'Type', key: 'transactionType' },
    { label: 'Block', key: 'blockNumber' },
    { label: 'Time', key: 'humanReadableTime' },
    { label: 'Direction', key: 'direction' },
    { label: 'Value', key: 'adjustedValue' },
    { 
      label: network === 'ETH' ? 'ETH Balance' : 'TRX Balance', 
      key: 'ethBalance' 
    },
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
    { 
      label: network === 'ETH' ? 'ETH Balance' : 'TRX Balance', 
      key: 'ethBalance' 
    },
    { label: 'USDT Balance', key: 'usdtBalance' },
    { label: 'USDC Balance', key: 'usdcBalance' },
    { label: 'Gas', key: 'gas' },
    { label: 'Gas Price', key: 'gasPrice' },
    { label: 'Gas Used', key: 'gasUsed' },
  ];

  const sageHeaders = [
    { label: 'Type', key: 'type' },
    { label: 'Account Reference', key: 'accountRef' },
    { label: 'Nominal A/C Ref', key: 'nominalRef' },
    { label: 'Department', key: 'department' },
    { label: 'Date', key: 'date' },
    { label: 'Reference', key: 'reference' },
    { label: 'Details', key: 'details' },
    { label: 'Net Amount', key: 'netAmount' },
    { label: 'T/C', key: 'tc' },
    { label: 'Tax Amount', key: 'taxAmount' },
    { label: 'Exchange Rate', key: 'exchangeRate' },
    { label: 'Ex.Ref', key: 'exRef' },
    { label: 'Username', key: 'username' },
    { label: 'Project Ref', key: 'projectRef' },
    { label: 'Cost Code', key: 'costCode' }
  ];

  const toggleRowExpansion = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Initialize balances
  let ethBalance = 0; // This will store ETH or TRX balance depending on network
  let usdtBalance = 0;
  let usdcBalance = 0;

  const transactionsWithAdditionalInfo = transactions
    .sort((a, b) => a.timeStamp - b.timeStamp)
    .map((tx) => {
      const fromAddress = tx.from ? tx.from.toLowerCase() : '';
      const direction = fromAddress === walletAddress.toLowerCase() ? 'Out' : 'In';

      // Convert the transaction value based on the token type and network
      let adjustedValue = tx.value;
      if (network === 'ETH') {
        if (tx.transactionType === 'ETH') {
          adjustedValue = parseFloat(tx.value) / 1e18;
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          adjustedValue = parseFloat(tx.value) / 1e6;
        }
      } else if (network === 'TRON') {
        if (tx.transactionType === 'TRX') {
          adjustedValue = parseFloat(tx.value) / 1e6;
        } else if (tx.transactionType === 'USDT' || tx.transactionType === 'USDC') {
          adjustedValue = parseFloat(tx.value) / 1e6;
        }
      }

      // Update balances
      if (tx.transactionType === (network === 'ETH' ? 'ETH' : 'TRX')) {
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
        ethBalance: ethBalance.toFixed(6), // This will be ETH or TRX balance
        usdtBalance: usdtBalance.toFixed(2),
        usdcBalance: usdcBalance.toFixed(2),
      };
    });

  const formatSageData = (transactions) => {
    return transactions.map(tx => {
      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();
      const direction = fromAddress === walletAddress.toLowerCase() ? 'Out' : 'In';
      const counterpartyAddress = direction === 'Out' ? toAddress : fromAddress;
      const knownWallet = knownWallets[counterpartyAddress];
      
      // Format date as DD/MM/YYYY
      const txDate = new Date(tx.timeStamp * 1000);
      const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth() + 1).toString().padStart(2, '0')}/${txDate.getFullYear()}`;

      // Determine transaction type and account reference
      let type;
      let accountRef;

      if (knownWallet) {
        if (knownWallet.sage_name) {
          // Known wallet with sage_name - use SA/SP
          type = direction === 'Out' ? 'SP' : 'SA';
          accountRef = knownWallet.sage_name;
        } else if (knownWallet.sage_nc) {
          // Known wallet with sage_nc - use BP/BR
          type = direction === 'Out' ? 'BP' : 'BR';
          accountRef = knownWallet.sage_nc;
        }
      } else {
        // Unknown wallet - use BP/BR with default reference
        type = direction === 'Out' ? 'BP' : 'BR';
        accountRef = '9999';
      }

      return {
        type,
        accountRef,
        nominalRef: '1201',
        department: '0',
        date: formattedDate,
        reference: direction,
        details: tx.hash,
        netAmount: Number(tx.adjustedValue).toFixed(2),
        tc: '0',
        taxAmount: '0',
        exchangeRate: '1',
        exRef: tx.transactionType,
        username: 'admin',
        projectRef: '',
        costCode: ''
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-xl">
        {/* Action Buttons */}
        <div className="p-4 space-y-4">
          <button 
            className="px-4 py-2 bg-green-600 text-gray-100 rounded-md 
              hover:bg-green-700 transition-colors duration-200"
            onClick={() => navigate('/summary')}
          >
            View Transaction Summary
          </button>

          {/* Navigation and Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <Link 
                to="/login"
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md 
                  hover:bg-gray-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/admin"
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md 
                  hover:bg-gray-600 transition-colors duration-200"
              >
                Admin
              </Link>
              <Link 
                to="/"
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md 
                  hover:bg-gray-600 transition-colors duration-200"
              >
                Home
              </Link>
            </div>

            <div className="text-gray-300 font-medium">
              Network: {network}
            </div>

            <CSVLink
              data={transactionsWithAdditionalInfo}
              headers={CSVheaders}
              filename={`${network.toLowerCase()}_transactions.csv`}
              className="px-4 py-2 bg-blue-600 text-gray-100 rounded-md 
                hover:bg-blue-700 transition-colors duration-200"
            >
              Download CSV
            </CSVLink>

            <CSVLink
              data={formatSageData(transactionsWithAdditionalInfo)}
              headers={sageHeaders}
              filename={`${network.toLowerCase()}_sage_import.csv`}
              className="px-4 py-2 bg-purple-600 text-gray-100 rounded-md 
                hover:bg-purple-700 transition-colors duration-200"
            >
              Download Sage Import
            </CSVLink>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700">
                {headers.map((header) => (
                  <th 
                    key={header.key} 
                    className="px-4 py-3 text-left text-gray-200 font-semibold border-b border-gray-600"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactionsWithAdditionalInfo.map((tx, index) => (
                <React.Fragment key={index}>
                  <tr 
                    onClick={() => toggleRowExpansion(index)}
                    className="border-b border-gray-700 hover:bg-gray-700/50 
                      cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-gray-300">{tx.transactionType}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.blockNumber}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.humanReadableTime}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.direction}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.adjustedValue}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.ethBalance}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.usdtBalance}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.usdcBalance}</td>
                    <td className="px-4 py-3 text-gray-300">{tx.gas}</td>
                  </tr>
                  {expandedRows.includes(index) && (
                    <tr className="bg-gray-700/50">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="space-y-2 text-gray-300">
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">Hash:</span> 
                            <span className="break-all">{tx.hash}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">From:</span> 
                            <span className="break-all">{tx.from}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">To:</span> 
                            <span className="break-all">{tx.to}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">Value:</span> 
                            <span>{tx.adjustedValue}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">Time:</span> 
                            <span>{tx.humanReadableTime}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">Gas Price:</span> 
                            <span>{tx.gasPrice}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="font-semibold min-w-[100px]">Gas Used:</span> 
                            <span>{tx.gasUsed}</span>
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
    </div>
  );
}

export default ResultsPage;
