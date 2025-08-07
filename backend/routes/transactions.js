const express = require('express');
const router = express.Router();

// Mock transaction data - in a real implementation, this would connect to a database
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

// Get transactions for an address
router.get('/', (req, res) => {
  const { address, chain, type } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  // Filter transactions by address (in a real implementation, this would be a database query)
  let filteredTransactions = mockTransactions.filter(tx => 
    tx.hash.toLowerCase().includes(address.toLowerCase().slice(-4))
  );
  
  // Filter by type if provided
  if (type && type !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
  }
  
  // Sort by timestamp (newest first)
  filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
  
  res.json(filteredTransactions);
});

module.exports = router;
