import React from 'react';

const ChainSelector = ({ chains, selectedChain, onChange, disabledChain }) => {
  const chainInfo = {
    '421614': { name: 'Arbitrum Sepolia', color: 'bg-blue-500' },
    '80002': { name: 'Polygon Amoy', color: 'bg-purple-500' },
    '42161': { name: 'Arbitrum One', color: 'bg-blue-600' },
    '56': { name: 'BNB Chain', color: 'bg-yellow-500' }
  };

  return (
    <select
      value={selectedChain}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg"
    >
      {Object.keys(chains).map(chainId => (
        <option 
          key={chainId} 
          value={chainId}
          disabled={chainId === disabledChain}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${chainInfo[chainId]?.color || 'bg-gray-300'}`}></div>
            {chainInfo[chainId]?.name || `Chain ${chainId}`}
          </div>
        </option>
      ))}
    </select>
  );
};

export default ChainSelector;
