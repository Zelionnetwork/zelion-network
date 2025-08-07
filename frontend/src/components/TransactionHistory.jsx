import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExchangeAlt, 
  faLock, 
  faUnlock, 
  faBridge 
} from '@fortawesome/free-solid-svg-icons';

const TransactionHistory = () => {
  const { account, chainId } = useWeb3React();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Use the backend API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (account) {
      fetchTransactionHistory();
    }
  }, [account, chainId, filter]);

  const fetchTransactionHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/transactions?address=${account}&chain=${chainId}&type=${filter}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Fallback to mock data if API is not available
      const mockTransactions = [
        {
          id: '1',
          hash: '0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678',
          type: 'swap',
          description: 'Swap 1 ETH for 1000 ZYL',
          amount: '1000000000000000000000',
          tokenSymbol: 'ZYL',
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          status: 'completed'
        },
        {
          id: '2',
          hash: '0x2b3c4d5e6f789012345678901234567890123456789012345678901234567890',
          type: 'stake',
          description: 'Stake 500 ZYL for 30 days',
          amount: '500000000000000000000',
          tokenSymbol: 'ZYL',
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          status: 'completed'
        },
        {
          id: '3',
          hash: '0x3c4d5e6f78901234567890123456789012345678901234567890123456789012',
          type: 'bridge',
          description: 'Bridge 200 ZYL to Arbitrum',
          amount: '200000000000000000000',
          tokenSymbol: 'ZYL',
          timestamp: Math.floor(Date.now() / 1000) - 10800,
          status: 'pending'
        }
      ];
      setTransactions(mockTransactions);
    }
    setIsLoading(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'swap': return <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-500" />;
      case 'stake': return <FontAwesomeIcon icon={faLock} className="text-yellow-500" />;
      case 'unstake': return <FontAwesomeIcon icon={faUnlock} className="text-green-500" />;
      case 'bridge': return <FontAwesomeIcon icon={faBridge} className="text-purple-500" />;
      default: return <FontAwesomeIcon icon={faExchangeAlt} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('swap')}
            className={`px-3 py-1 rounded-lg ${filter === 'swap' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Swaps
          </button>
          <button 
            onClick={() => setFilter('stake')}
            className={`px-3 py-1 rounded-lg ${filter === 'stake' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Staking
          </button>
          <button 
            onClick={() => setFilter('bridge')}
            className={`px-3 py-1 rounded-lg ${filter === 'bridge' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Bridge
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getIcon(tx.type)}
                      </div>
                      <div className="ml-4 capitalize">{tx.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{tx.description}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{tx.hash}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tx.amount ? `${formatEther(tx.amount)} ${tx.tokenSymbol || ''}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 flex justify-between items-center">
        <button 
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          disabled
        >
          Previous
        </button>
        <span className="text-gray-600">Page 1 of 1</span>
        <button 
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
      
      <div className="mt-6 flex justify-center">
        <button className="flex items-center text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export as CSV
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
