'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useAccount, useChainId, useBalance, usePublicClient } from 'wagmi';
import { useSwap } from '../hooks/useSwap';

export default function SwapPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('ZYL');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [swapStep, setSwapStep] = useState('input');
  const [transactionHash, setTransactionHash] = useState('');

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Use swap hook
  const {
    isLoading,
    error,
    quote,
    tokenBalances,
    getTokenBalance,
    getSwapQuote,
    executeSwap,
    getSupportedTokens,
    getTokensFromFaucet,
    clearError,
    reset,
  } = useSwap();

  const supportedChains = [
    { id: 42161, name: 'Arbitrum One', symbol: 'ARB' },
    { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ARB' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 80002, name: 'Polygon Amoy', symbol: 'MATIC' },
  ];

  const supportedTokens = [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'ZYL', name: 'Zelion Token', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18 },
  ];

  // Get available tokens for current chain
  const availableTokens = getSupportedTokens();

  const currentChain = supportedChains.find(chain => chain.id === chainId);

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      calculateOutputAmount();
    }
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => {
    if (isConnected && address && fromToken && publicClient) {
      getTokenBalance(fromToken);
    }
  }, [isConnected, address, fromToken, getTokenBalance, publicClient]);

  const calculateOutputAmount = async () => {
    if (!fromAmount || !fromToken || !toToken) return;
    
    try {
      const quote = await getSwapQuote(fromToken, toToken, fromAmount);
      if (quote) {
        setToAmount(quote.outputAmount.toFixed(6));
      }
    } catch (error) {
      console.error('Price calculation error:', error);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!isConnected || !fromAmount || !toAmount) {
      return;
    }

    if (!currentChain) {
      return;
    }

    setSwapStep('swapping');

    try {
      const result = await executeSwap(fromToken, toToken, fromAmount, slippage);
      
      if (result.success) {
        setTransactionHash(result.transactionHash);
        setSwapStep('success');
        
        // Reset after success
        setTimeout(() => {
          setSwapStep('input');
          setTransactionHash('');
          setFromAmount('');
          setToAmount('');
          reset();
        }, 5000);
      } else {
        setSwapStep('input');
      }
      
    } catch (error) {
      console.error('Swap failed:', error);
      setSwapStep('input');
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    return parseFloat(balance.formatted).toFixed(4);
  };

  return (
    <section className="min-h-screen py-20 px-6 sm:px-12 bg-[#0f1115]/80 text-white font-body relative">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#00f0ff0d] to-transparent pointer-events-none" />
      
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-heading text-cyan-300 text-center mb-4">
          Zelion Token Swap
        </h2>
        <div className="glass p-8 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md space-y-6">
          {/* Chain Info */}
          <div className="text-center">
            <p className="text-sm text-cyan-200 mb-1">Current Network</p>
            <p className="text-lg font-semibold text-cyan-300">
              {currentChain ? currentChain.name : 'Unsupported Network'}
            </p>
          </div>

          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-200 block">From</label>
            <div className="flex gap-3">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="px-4 py-3 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400"
              >
                {supportedTokens.filter(token => availableTokens.includes(token.symbol)).map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                className="flex-1 px-4 py-3 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400"
              />
            </div>
            {tokenBalances[fromToken] && (
              <p className="text-xs text-cyan-300">
                Balance: {tokenBalances[fromToken].formatted} {fromToken}
              </p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-full hover:bg-cyan-500/30 transition-colors"
            >
              <ArrowUpDown className="w-5 h-5 text-cyan-300" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-200 block">To</label>
            <div className="flex gap-3">
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="px-4 py-3 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none focus:border-cyan-400"
              >
                {supportedTokens.filter(token => availableTokens.includes(token.symbol)).map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                readOnly
                className="flex-1 px-4 py-3 bg-black/20 text-gray-400 border border-cyan-500/20 rounded-lg"
              />
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-300">
                <Loader2 className="w-3 h-3 animate-spin" />
                Calculating...
              </div>
            )}
          </div>

          {/* Slippage Settings */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-200 block">Slippage Tolerance</label>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded text-sm ${
                    slippage === value
                      ? 'bg-cyan-500 text-black'
                      : 'bg-black/30 text-cyan-300 border border-cyan-500/20'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                placeholder="Custom"
                step="0.1"
                min="0.1"
                max="50"
                className="flex-1 px-3 py-1 bg-black/30 text-white border border-cyan-500/20 rounded text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 text-lg font-bold ml-auto"
              >
                ×
              </button>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-cyan-300 text-sm mb-1">Transaction Hash:</p>
              <p className="text-xs font-mono text-cyan-200 break-all">{transactionHash}</p>
              <p className="text-xs text-cyan-300 mt-2">
                ✅ Swap executed successfully using Zelion SwapRouter!
              </p>
            </div>
          )}

          {/* Swap Button */}
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-cyan-300 mb-4">Please connect your wallet to swap tokens</p>
            </div>
          ) : !currentChain ? (
            <div className="text-center py-4">
              <p className="text-yellow-300 mb-4">Please switch to a supported network</p>
            </div>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!fromAmount || !toAmount || isLoading}
              className="w-full btn-zelion flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && swapStep === 'swapping' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Swapping...
                </>
              ) : swapStep === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Swap Successful!
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Swap Tokens
                </>
              )}
            </button>
          )}

          {/* Price Info */}
          {quote && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 space-y-2">
              <p className="text-cyan-300 text-sm">
                1 {fromToken} = {quote.price.toFixed(6)} {toToken}
              </p>
              <p className="text-cyan-300 text-xs">
                Price Impact: {quote.priceImpact.toFixed(2)}%
              </p>
              <p className="text-cyan-300 text-xs">
                Minimum Received: {quote.minimumReceived.toFixed(6)} {toToken}
              </p>
            </div>
          )}

          {/* Faucet Section */}
          {currentChain && currentChain.id === 421614 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-3">
              <h3 className="text-purple-300 text-sm font-semibold">Get Test Tokens</h3>
              <p className="text-purple-200 text-xs">
                Need tokens to test swaps? Get them from the Zelion Faucet!
              </p>
              <div className="flex flex-wrap gap-2">
                {['ZYL', 'WETH', 'USDC', 'USDT', 'DAI'].map((token) => (
                  <button
                    key={token}
                    onClick={() => getTokensFromFaucet(token)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300 hover:bg-purple-500/30 disabled:opacity-50"
                  >
                    Get {token}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
