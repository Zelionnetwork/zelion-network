import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import SwapABI from '../abis/Swap.json';
import TokenABI from '../abis/ZYLToken.json';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const SwapInterface = () => {
  const { account, library } = useWeb3React();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('ZYL');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(10);
  const [showSettings, setShowSettings] = useState(false);
  const [tokenBalances, setTokenBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  
  const SWAP_CONTRACT = process.env.REACT_APP_SWAP_CONTRACT;
  const TOKEN_CONTRACT = process.env.REACT_APP_TOKEN_CONTRACT;

  // Token list
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' },
    { symbol: 'ZYL', name: 'Zylithium Token', address: TOKEN_CONTRACT },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
  ];

  useEffect(() => {
    if (account) {
      fetchBalances();
      fetchExchangeRate();
    }
  }, [account, fromToken, toToken]);

  const fetchBalances = async () => {
    const provider = library.getSigner();
    const balances = {};
    
    for (const token of tokens) {
      if (token.symbol === 'ETH') {
        const balance = await provider.getBalance();
        balances.ETH = formatEther(balance);
      } else {
        const tokenContract = new ethers.Contract(token.address, TokenABI, provider);
        const balance = await tokenContract.balanceOf(account);
        balances[token.symbol] = formatEther(balance);
      }
    }
    
    setTokenBalances(balances);
  };

  const fetchExchangeRate = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;
    
    try {
      const provider = library.getSigner();
      const swapContract = new ethers.Contract(SWAP_CONTRACT, SwapABI, provider);
      
      const fromTokenObj = tokens.find(t => t.symbol === fromToken);
      const toTokenObj = tokens.find(t => t.symbol === toToken);
      
      const amountOut = await swapContract.getAmountOut(
        fromTokenObj.address,
        toTokenObj.address,
        parseEther(fromAmount)
      );
      
      setToAmount(formatEther(amountOut));
      
      // Calculate price impact
      const reserves = await swapContract.getReserves(fromTokenObj.address, toTokenObj.address);
      const reserveFrom = parseFloat(formatEther(reserves[0]));
      const reserveTo = parseFloat(formatEther(reserves[1]));
      
      const expectedAmount = (reserveTo * parseFloat(fromAmount)) / reserveFrom;
      const impact = ((expectedAmount - parseFloat(formatEther(amountOut))) / expectedAmount * 100);
      setPriceImpact(impact);
      
      // Calculate exchange rate
      setExchangeRate(parseFloat(fromAmount) / parseFloat(formatEther(amountOut)));
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;
    
    try {
      setIsLoading(true);
      const provider = library.getSigner();
      const swapContract = new ethers.Contract(SWAP_CONTRACT, SwapABI, provider);
      
      const fromTokenObj = tokens.find(t => t.symbol === fromToken);
      const toTokenObj = tokens.find(t => t.symbol === toToken);
      
      // For ETH, send value, for tokens, approve first
      let tx;
      if (fromToken === 'ETH') {
        tx = await swapContract.swapETHForTokens(
          toTokenObj.address,
          parseEther(fromAmount),
          { value: parseEther(fromAmount) }
        );
      } else {
        const tokenContract = new ethers.Contract(fromTokenObj.address, TokenABI, provider);
        await tokenContract.approve(SWAP_CONTRACT, parseEther(fromAmount));
        
        tx = await swapContract.swapTokensForTokens(
          fromTokenObj.address,
          toTokenObj.address,
          parseEther(fromAmount)
        );
      }
      
      await tx.wait();
      await fetchBalances();
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    }
    setIsLoading(false);
  };

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Swap Tokens</h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faCog} size="lg" />
        </button>
      </div>
      
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Transaction Settings</h3>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Slippage Tolerance (%)</label>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded-lg ${slippage === value ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                >
                  {value}%
                </button>
              ))}
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                  className="w-full pl-8 pr-3 py-1 border rounded-lg"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Transaction Deadline (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={deadline}
              onChange={(e) => setDeadline(parseInt(e.target.value) || 10)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      )}
      
      <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
        <div className="flex justify-between text-sm text-indigo-700 mb-1">
          <span>Exchange Rate</span>
          <span>1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}</span>
        </div>
        <div className="flex justify-between text-sm text-indigo-700">
          <span>Price Impact</span>
          <span className={priceImpact > 2 ? 'text-red-500' : 'text-green-500'}>
            {priceImpact.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="relative mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>From</span>
          <span>Balance: {tokenBalances[fromToken] || '0.00'}</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => {
              setFromAmount(e.target.value);
              if (e.target.value) fetchExchangeRate();
            }}
            placeholder="0.0"
            className="flex-1 p-0 text-2xl bg-transparent border-none focus:outline-none"
          />
          <div className="relative">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border rounded-lg appearance-none focus:outline-none"
            >
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center my-2">
        <button 
          onClick={handleSwitchTokens}
          className="p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>To</span>
          <span>Balance: {tokenBalances[toToken] || '0.00'}</span>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={toAmount || '0.0'}
            readOnly
            placeholder="0.0"
            className="flex-1 p-0 text-2xl bg-transparent border-none focus:outline-none"
          />
          <div className="relative">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border rounded-lg appearance-none focus:outline-none"
            >
              {tokens
                .filter(token => token.symbol !== fromToken)
                .map(token => (
                  <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSwap}
        disabled={isLoading || !fromAmount || parseFloat(fromAmount) <= 0}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Swapping...' : 'Swap'}
      </button>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Slippage Tolerance: {slippage}% | Deadline: {deadline} mins
      </div>
    </div>
  );
};

export default SwapInterface;
