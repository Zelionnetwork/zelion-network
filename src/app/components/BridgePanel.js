'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useBridge } from '../hooks/useBridge';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';

export default function BridgePanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    isLoading,
    error,
    feeEstimate,
    tokenBalance,
    isConnected: bridgeConnected,
    estimateFee,
    getTokenBalance,
    approveTokens,
    executeBridge,
    clearError,
    reset,
  } = useBridge();

  const [fromChain, setFromChain] = useState('Arbitrum Sepolia');
  const [toChain, setToChain] = useState('Polygon Amoy');
  const [selectedToken, setSelectedToken] = useState('ZYL');
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [bridgeStep, setBridgeStep] = useState('input');
  const [approvalStep, setApprovalStep] = useState('pending');
  const [transactionHash, setTransactionHash] = useState('');

  const supportedChains = [
    'Arbitrum Sepolia',
    'Polygon Amoy',
    'Arbitrum One',
    'Polygon',
    'Ethereum Mainnet',
    'Ethereum Sepolia',
    'Optimism',
    'Optimism Goerli',
    'Base',
    'Base Sepolia',
    'Avalanche',
    'Avalanche Fuji',
    'BNB Chain',
    'BNB Testnet',
  ];

  const supportedTokens = ['ZYL', 'USDC', 'DAI', 'WETH', 'WBTC', 'ETH'];

  useEffect(() => {
    if (address) {
      setReceiverAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address && fromChain) {
      getTokenBalance(fromChain);
    }
  }, [isConnected, address, fromChain, getTokenBalance]);

  const handleJoinWaitlist = () => {
    window.open('https://mailchi.mp/763cb178e081/zelion-network', '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleEstimateFee = async () => {
    if (!amount || !fromChain || !toChain) {
      return;
    }

    setBridgeStep('estimating');
    const amountWei = ethers.parseEther(amount);
    await estimateFee(fromChain, toChain, amountWei);
    setBridgeStep('input');
  };

  const isValidAddress = (address) => {
    return ethers.isAddress(address);
  };

  const handleBridgeTokens = async () => {
    if (!isConnected || !amount || !fromChain || !toChain || !receiverAddress) {
      return;
    }

    if (!isValidAddress(receiverAddress)) {
      setError('Invalid receiver address');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (fromChain === 'Arbitrum Sepolia' && chainId !== 421614) {
      setError('Please switch to Arbitrum Sepolia network');
      return;
    }

    setBridgeStep('bridging');
    const amountWei = ethers.parseEther(amount);
    
    try {
      setApprovalStep('pending');
      const approveResult = await approveTokens(fromChain, amountWei);
      
      if (!approveResult.success) {
        setApprovalStep('failed');
        setBridgeStep('input');
        // Check if it's a user cancellation
        if (approveResult.error && (approveResult.error.includes('User denied') || approveResult.error.includes('User rejected'))) {
          setApprovalStep('pending'); // Reset to pending so user can try again
        }
        return;
      }
      
      setApprovalStep('approved');
      
      const result = await executeBridge(fromChain, toChain, amountWei, receiverAddress);
      
      if (result && result.success) {
        setTransactionHash(result.transactionHash);
        setBridgeStep('success');
        setTimeout(() => {
          setBridgeStep('input');
          setApprovalStep('pending');
          setTransactionHash('');
          reset();
        }, 10000);
      } else {
        setBridgeStep('input');
      }
    } catch (error) {
      console.error('Bridge execution failed:', error);
      setBridgeStep('input');
      setApprovalStep('failed');
    }
  };

  return (
    <section className="min-h-screen py-20 px-6 sm:px-12 bg-[#0f1115]/80 text-white font-body relative">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#00f0ff0d] to-transparent pointer-events-none" />
      <h2 className="text-3xl font-heading text-cyan-300 text-center mb-10">
        Cross-Chain Bridge
      </h2>

      <div className="glass max-w-3xl mx-auto p-8 rounded-xl shadow-xl border border-cyan-500/20 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="text-sm text-cyan-200 block mb-1">From Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
            >
              {supportedChains.map((chain) => (
                <option key={chain}>{chain}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm text-cyan-200 block mb-1">To Chain</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
              className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
            >
              {supportedChains.map((chain) => (
                <option key={chain}>{chain}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-cyan-200 block mb-1">Select Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
          >
            {supportedTokens.map((token) => (
              <option key={token}>{token}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-cyan-200 block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.000001"
            className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
          />
          {tokenBalance && (
            <p className="text-xs text-cyan-300 mt-1">
              Balance: {ethers.formatEther(tokenBalance)} {selectedToken}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-cyan-200 block mb-1">Receiver Address</label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              {error.includes('User denied transaction signature') || error.includes('User rejected the request') ? (
                <div>
                  <p className="text-red-300 text-sm font-medium mb-1">Transaction Cancelled</p>
                  <p className="text-red-200 text-xs">You cancelled the transaction in MetaMask. Please try again when ready.</p>
                </div>
              ) : error.includes('insufficient funds') || error.includes('Insufficient') ? (
                <div>
                  <p className="text-red-300 text-sm font-medium mb-1">Insufficient Balance</p>
                  <p className="text-red-200 text-xs">You don't have enough tokens or ETH for this transaction.</p>
                </div>
              ) : error.includes('network') || error.includes('Network') ? (
                <div>
                  <p className="text-red-300 text-sm font-medium mb-1">Network Error</p>
                  <p className="text-red-200 text-xs">Please make sure you're connected to the correct network (Arbitrum Sepolia).</p>
                </div>
              ) : (
                <p className="text-red-300 text-sm">{error}</p>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        {feeEstimate && (
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
            <p className="text-cyan-300 text-sm">
              Estimated Fee: {ethers.formatEther(feeEstimate.fee)} ETH
            </p>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-cyan-300 mb-4">Please connect your wallet to bridge tokens</p>
          </div>
        ) : fromChain === 'Arbitrum Sepolia' && chainId !== 421614 ? (
          <div className="text-center py-4">
            <p className="text-yellow-300 mb-4">Please switch to Arbitrum Sepolia network to bridge tokens</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {approvalStep !== 'pending' && (
              <div className={`p-3 rounded-lg border ${
                approvalStep === 'approved' 
                  ? 'bg-green-500/20 border-green-500/30' 
                  : 'bg-red-500/20 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  {approvalStep === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-sm ${
                    approvalStep === 'approved' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    Token Approval: {approvalStep === 'approved' ? 'Approved' : 'Failed'}
                  </p>
                </div>
              </div>
            )}

            {transactionHash && (
              <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-cyan-300 text-sm mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono text-cyan-200 break-all">{transactionHash}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleEstimateFee}
                disabled={!amount || isLoading}
                className="btn-zelion flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && bridgeStep === 'estimating' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  'Estimate Fee'
                )}
              </button>

              <button
                onClick={handleBridgeTokens}
                disabled={!amount || !feeEstimate || isLoading}
                className="btn-zelion flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && bridgeStep === 'bridging' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {approvalStep === 'pending' ? 'Approving...' : 'Bridging...'}
                  </>
                ) : bridgeStep === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Success!
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Bridge Tokens
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* <div className="mt-6 pt-4 border-t border-cyan-500/20">
          <p className="text-sm text-cyan-100 mb-3">
            Want to be notified when new features are available?
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
            />
            <button
              onClick={handleJoinWaitlist}
              className="btn-zelion flex items-center justify-center gap-2"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400 animate-scale-fade" />
                  Joined!
                </>
              ) : (
                'Join Waitlist'
              )}
            </button>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        .animate-scale-fade {
          animation: scaleFade 0.4s ease-in-out;
        }
        @keyframes scaleFade {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
