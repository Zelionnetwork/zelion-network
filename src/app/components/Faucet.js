'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { useFaucet } from '../hooks/useFaucet';
import { 
  Wallet, 
  Coins, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Zap
} from 'lucide-react';

const CHAIN_INFO = {
  1: { name: 'Ethereum', symbol: 'ETH', color: 'from-cyan-400 to-cyan-600' },
  137: { name: 'Polygon', symbol: 'MATIC', color: 'from-fuchsia-400 to-pink-500' },
  42161: { name: 'Arbitrum', symbol: 'ETH', color: 'from-blue-400 to-indigo-600' },
  10: { name: 'Optimism', symbol: 'ETH', color: 'from-red-400 to-pink-500' },
  8453: { name: 'Base', symbol: 'ETH', color: 'from-sky-400 to-blue-500' },
  534352: { name: 'Scroll', symbol: 'ETH', color: 'from-yellow-300 to-orange-400' },
  421614: { name: 'Arbitrum Sepolia', symbol: 'ZYL', color: 'from-blue-400 to-indigo-600' },
  80002: { name: 'Polygon Amoy', symbol: 'MATIC', color: 'from-fuchsia-400 to-pink-500' },
  11155111: { name: 'Ethereum Sepolia', symbol: 'ETH', color: 'from-cyan-400 to-cyan-600' },
  84532: { name: 'Base Sepolia', symbol: 'ETH', color: 'from-sky-400 to-blue-500' },
};

export default function Faucet() {
  const { switchChain } = useSwitchChain();
  const {
    isLoading,
    error,
    success,
    lastRequestTime,
    cooldownTime,
    currentChainId,
    faucetAddress,
    hasFaucet,
    isConnected,
    address,
    tokenBalance,
    requestTokens,
    clearMessages,
  } = useFaucet();

  // Debug logging - commented out to reduce console spam
  // console.log('Faucet Component State:', {
  //   isConnected,
  //   currentChainId,
  //   hasFaucet,
  //   faucetAddress,
  //   address,
  //   cooldownTime,
  //   tokenBalance: tokenBalance?.toString()
  // });

  const chainInfo = currentChainId ? CHAIN_INFO[currentChainId] : null;

  useEffect(() => {
    if (lastRequestTime) {
      const cooldown = 24 * 60 * 60 * 1000; 
      const timeSinceLastRequest = Date.now() - lastRequestTime;
      const remainingTime = Math.max(0, cooldown - timeSinceLastRequest);
      
      if (remainingTime > 0) {
        const timer = setInterval(() => {
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [lastRequestTime]);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const switchToTestnet = () => {
    if (switchChain) {
      switchChain({ chainId: 421614 }); // Switch to Arbitrum Sepolia (has faucet)
    }
  };

  return (
    <section className="py-24 px-6 sm:px-12 bg-[#0f1115] text-white font-body relative backdrop-blur-lg">
      <div className="relative z-10 lg:max-w-4xl mx-auto space-y-12">
        <div className="flex justify-center">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <Wallet className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-4">Connect your wallet to access the faucet</p>
                <ConnectButton.Custom>
                  {({ openConnectModal, mounted }) => {
                    if (!mounted) {
                      return <div>Loading...</div>;
                    }
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Connect Wallet
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-6">
              {/* Current Chain Status */}
              <div className="p-6 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-200">Current Chain</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${chainInfo?.color || 'from-gray-400 to-gray-600'}`} />
                    <span className="text-sm text-gray-300">{chainInfo?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                {!hasFaucet ? (
                  <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto" />
                    <p className="text-yellow-300">No faucet available on {chainInfo?.name || 'this chain'}</p>
                    <button
                      onClick={switchToTestnet}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Switch to Testnet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0b0f] rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300">Faucet Contract</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400 font-mono">
                          {faucetAddress.slice(0, 6)}...{faucetAddress.slice(-4)}
                        </span>
                        <a
                          href={`https://sepolia.arbiscan.io/address/${faucetAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* User Balance Display */}
                    <div className="flex items-center justify-between p-4 bg-[#0a0b0f] rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Coins className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300">Your ZYL Balance</span>
                      </div>
                      <div className="text-xl font-semibold text-cyan-200">
                        {tokenBalance ? formatEther(tokenBalance) : '0'} ZYL
                      </div>
                    </div>

                    {/* Cooldown Timer */}
                    {cooldownTime > 0 && (
                      <div className="p-4 bg-[#0a0b0f] rounded-xl border border-yellow-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                            <span className="text-yellow-300">Cooldown Active</span>
                          </div>
                          <span className="text-2xl font-mono text-yellow-400">
                            {formatTime(cooldownTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          You can request tokens again after the cooldown period ends
                        </p>
                      </div>
                    )}

                    {/* Request Button */}
                    <button
                      onClick={requestTokens}
                      disabled={isLoading || cooldownTime > 0}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                        isLoading || cooldownTime > 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:scale-105'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Coins className="w-5 h-5" />
                          <span>Request 100 {chainInfo?.symbol || 'ZYL'} Tokens</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-300 font-medium">Error</p>
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                    <button
                      onClick={clearMessages}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {success && (
                <div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-300 font-medium">Success!</p>
                      <p className="text-green-200 text-sm">{success.message}</p>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${success.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 text-sm inline-flex items-center space-x-1 mt-1"
                      >
                        <span>View Transaction</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={clearMessages}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
