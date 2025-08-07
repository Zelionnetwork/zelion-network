import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import BridgeABI from '../abis/Bridge.json';
import TokenABI from '../abis/ZYLToken.json';
import ChainSelector from './ChainSelector';

const BridgeInterface = () => {
  const { account, library, chainId } = useWeb3React();
  const [fromChain, setFromChain] = useState('421614'); // Arbitrum Sepolia
  const [toChain, setToChain] = useState('80002'); // Polygon Amoy
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState('0');

  // Chain configurations
  const CHAINS = {
    421614: { name: 'Arbitrum Sepolia', bridge: '0x...' },
    80002: { name: 'Polygon Amoy', bridge: '0x...' },
    42161: { name: 'Arbitrum One', bridge: '0x...' },
    56: { name: 'BNB Chain', bridge: '0x...' }
  };

  useEffect(() => {
    if (account && fromChain) {
      loadTokenList();
      loadBalance();
    }
  }, [account, fromChain]);

  useEffect(() => {
    if (amount && token && fromChain && toChain) {
      estimateFee();
    }
  }, [amount, token, fromChain, toChain]);

  const loadTokenList = async () => {
    // In a real app, this would come from the bridge contract
    const mockTokens = [
      { address: '0x123...', symbol: 'ZYL', name: 'Zylithium Token' },
      { address: '0x456...', symbol: 'USDC', name: 'USD Coin' }
    ];
    setTokens(mockTokens);
    if (mockTokens.length > 0) setToken(mockTokens[0].address);
  };

  const loadBalance = async () => {
    if (!token || !account) return;
    
    const provider = new ethers.providers.Web3Provider(library.provider);
    const tokenContract = new ethers.Contract(token, TokenABI, provider);
    const balance = await tokenContract.balanceOf(account);
    setBalance(ethers.utils.formatEther(balance));
  };

  const estimateFee = async () => {
    if (!token || !amount || !fromChain || !toChain) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(library.provider);
      const bridgeContract = new ethers.Contract(
        CHAINS[fromChain].bridge, 
        BridgeABI, 
        provider
      );
      
      const fee = await bridgeContract.estimateBridgeFee(
        CHAINS[toChain].selector,
        token,
        ethers.utils.parseEther(amount)
      );
      
      setFee(ethers.utils.formatEther(fee));
    } catch (error) {
      console.error('Fee estimation failed:', error);
      setFee('0');
    }
  };

  const bridgeTokens = async () => {
    if (!token || !amount || !fromChain || !toChain || !account) return;
    
    try {
      setIsLoading(true);
      const signer = library.getSigner();
      const bridgeContract = new ethers.Contract(
        CHAINS[fromChain].bridge, 
        BridgeABI, 
        signer
      );
      
      const tokenContract = new ethers.Contract(token, TokenABI, signer);
      
      // Approve tokens
      const amountWei = ethers.utils.parseEther(amount);
      await tokenContract.approve(bridgeContract.address, amountWei);
      
      // Execute bridge
      const tx = await bridgeContract.bridgeTokens(
        CHAINS[toChain].selector,
        token,
        amountWei,
        { value: ethers.utils.parseEther(fee) }
      );
      
      await tx.wait();
      alert('Bridge transaction successful!');
    } catch (error) {
      console.error('Bridging failed:', error);
      alert(`Bridge failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cross-Chain Bridge</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">From Chain</label>
          <ChainSelector 
            chains={CHAINS} 
            selectedChain={fromChain} 
            onChange={setFromChain}
            disabledChain={toChain}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">To Chain</label>
          <ChainSelector 
            chains={CHAINS} 
            selectedChain={toChain} 
            onChange={setToChain}
            disabledChain={fromChain}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Token</label>
        <select
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          {tokens.map(t => (
            <option key={t.address} value={t.address}>
              {t.symbol} - {t.name}
            </option>
          ))}
        </select>
        <div className="text-right text-sm text-gray-500 mt-1">
          Balance: {balance}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full p-3 border rounded-lg"
        />
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Estimated Fee:</span>
          <span className="font-bold">{fee} ETH</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Destination Chain:</span>
          <span>{CHAINS[toChain]?.name || 'Unknown'}</span>
        </div>
      </div>
      
      <button
        onClick={bridgeTokens}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Bridging...' : 'Bridge Tokens'}
      </button>
    </div>
  );
};

export default BridgeInterface;
