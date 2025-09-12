'use client';

import { useState, useEffect } from 'react';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  TrendingUp, 
  Award, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Wallet,
  Sparkles,
  Zap,
  Timer,
  Shield,
  Star,
  Clock,
  X
} from 'lucide-react';

// Deployed contract addresses on Arbitrum Sepolia (Jan 3, 2025)
const TOKEN_CONFIG = {
  address: '0xB3F18c487c020A0EfD0dae6F1EDDbE24fcc757D0',
  symbol: 'ZYL',
  decimals: 18
};

const STAKING_CONTRACT = {
  address: '0xC5E05EBA99784b00Dd0244c0E47A4DAe79F2eF72',
  chainId: 421614, // Arbitrum Sepolia
  abi: [
    {
      name: 'stake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'amount', type: 'uint256' }],
      outputs: [],
    },
    {
      name: 'unstake',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'amount', type: 'uint256' }],
      outputs: [],
    },
    {
      name: 'claimRewards',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [],
      outputs: [],
    },
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      name: 'totalStaked',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      name: 'stakes',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: '', type: 'address' }],
      outputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'startTime', type: 'uint256' },
        { name: 'lastClaimTime', type: 'uint256' }
      ],
    },
    {
      name: 'getStakeInfo',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'startTime', type: 'uint256' },
        { name: 'lastClaimTime', type: 'uint256' },
        { name: 'pending', type: 'uint256' }
      ],
    },
    {
      name: 'pendingRewards',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      name: 'rewardRate',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    },
  ],
};

export default function Staking() {
  const { address, isConnected } = useAccount();
  
  // Form states
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Token contract for balance and approval
  const TOKEN_ABI = [
    {
      "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "address", "name": "spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "spender", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Contract reads with refetch capability
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: TOKEN_CONFIG.address,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    watch: true, // Enable automatic refetching
  });

  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_CONFIG.address,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_CONTRACT.address] : undefined,
    watch: true, // Enable automatic refetching
  });

  const { data: userStakedBalance, refetch: refetchUserStakedBalance, error: stakedError } = useReadContract({
    ...STAKING_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    watch: true, // Enable automatic refetching
    enabled: !!address, // Only fetch when address is available
  });

  const { data: pendingRewards, refetch: refetchPendingRewards, error: rewardsError } = useReadContract({
    ...STAKING_CONTRACT,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    watch: true, // Enable automatic refetching
    enabled: !!address, // Only fetch when address is available
  });

  // totalStaked is a public state variable, we read it directly
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: STAKING_CONTRACT.address,
    abi: [{
      name: 'totalStaked',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    }],
    functionName: 'totalStaked',
    watch: true, // Enable automatic refetching
  });
  
  // Debug logging
  useEffect(() => {
    if (address) {
      console.log('Staking Debug:', {
        address,
        userStakedBalance: userStakedBalance?.toString(),
        pendingRewards: pendingRewards?.toString(),
        totalStaked: totalStaked?.toString(),
        stakedError,
        rewardsError
      });
    }
  }, [address, userStakedBalance, pendingRewards, totalStaked, stakedError, rewardsError]);

  const { data: rewardRate } = useReadContract({
    ...STAKING_CONTRACT,
    functionName: 'rewardRate',
  });

  // Contract writes
  const { writeContract: approveTokens, data: approveTxHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: stakeTokens, data: stakeTxHash, isPending: isStakePending } = useWriteContract();
  const { writeContract: unstakeTokens, data: unstakeTxHash, isPending: isUnstakePending } = useWriteContract();
  const { writeContract: claimRewards, data: claimTxHash, isPending: isClaimPending } = useWriteContract();

  // Watch for approval success
  const { isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Watch for stake success
  const { isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeTxHash,
  });

  // Watch for unstake success
  const { isSuccess: isUnstakeSuccess } = useWaitForTransactionReceipt({
    hash: unstakeTxHash,
  });

  // Watch for claim success
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproving(false);
      addToast('Tokens approved! You can now stake.', 'success');
      // Refetch allowance after approval
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);
  
  useEffect(() => {
    if (isStakeSuccess) {
      setIsStaking(false);
      setStakeAmount('');
      addToast('Tokens staked successfully!', 'success');
      // Immediately refetch and then again after delay
      refetchBalance();
      refetchAllowance();
      refetchUserStakedBalance();
      refetchTotalStaked();
      refetchPendingRewards();
      
      // Also refetch after delay to ensure blockchain state is updated
      setTimeout(() => {
        console.log('Refetching staking data after successful stake...');
        refetchBalance();
        refetchAllowance();
        refetchUserStakedBalance();
        refetchTotalStaked();
        refetchPendingRewards();
      }, 3000); // 3 second delay for blockchain confirmation
      
      // Another refetch after 5 seconds for additional confirmation
      setTimeout(() => {
        refetchUserStakedBalance();
        refetchTotalStaked();
        refetchPendingRewards();
      }, 5000);
    }
  }, [isStakeSuccess, refetchBalance, refetchAllowance, refetchUserStakedBalance, refetchTotalStaked, refetchPendingRewards]);
  
  useEffect(() => {
    if (isUnstakeSuccess) {
      setIsUnstaking(false);
      setUnstakeAmount('');
      addToast('Tokens unstaked successfully!', 'success');
      // Refetch all values after unstaking
      refetchBalance();
      refetchUserStakedBalance();
      refetchTotalStaked();
      refetchPendingRewards();
    }
  }, [isUnstakeSuccess, refetchBalance, refetchUserStakedBalance, refetchTotalStaked, refetchPendingRewards]);
  
  useEffect(() => {
    if (isClaimSuccess) {
      setIsClaiming(false);
      addToast('Rewards claimed successfully!', 'success');
      // Refetch balance and rewards after claiming
      refetchBalance();
      refetchPendingRewards();
    }
  }, [isClaimSuccess, refetchBalance, refetchPendingRewards]);

  // Calculate APY based on contract's reward rate (100 basis points = 1% per day)
  const calculateAPY = () => {
    if (!rewardRate) return 0;
    try {
      // rewardRate is 100 basis points (1% per day)
      // Convert basis points to percentage: 100 / 10000 = 0.01 (1%)
      const dailyRate = Number(rewardRate) / 10000; // 100 / 10000 = 0.01
      // Annual rate: (1 + dailyRate)^365 - 1
      const annualRate = Math.pow(1 + dailyRate, 365) - 1;
      return (annualRate * 100).toFixed(2);
    } catch {
      return 0;
    }
  };

  // Handle approval
  const handleApprove = async () => {
    if (!stakeAmount || !approveTokens) return;
    
    try {
      const amount = parseEther(stakeAmount);
      approveTokens({
        address: TOKEN_CONFIG.address,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [STAKING_CONTRACT.address, amount]
      });
      addToast('Approving tokens...', 'info');
    } catch (error) {
      console.error('Approval error:', error);
      addToast('Approval failed', 'error');
    }
  };

  // Handle staking
  const handleStake = async () => {
    console.log('Stake button clicked');
    console.log('Stake amount:', stakeAmount);
    console.log('Token balance:', tokenBalance ? formatEther(tokenBalance) : 'Loading...');
    console.log('Token allowance:', tokenAllowance ? formatEther(tokenAllowance) : 'Loading...');
    
    if (!stakeAmount) {
      addToast('Please enter an amount to stake', 'error');
      return;
    }
    
    if (!stakeTokens) {
      console.error('Stake function not available');
      addToast('Contract not loaded', 'error');
      return;
    }
    
    try {
      const amount = parseEther(stakeAmount);
      console.log('Parsed amount:', amount.toString());
      
      // Check if user has any ZYL tokens
      if (!tokenBalance || tokenBalance === 0n) {
        addToast('You need ZYL tokens first. Use the Faucet to get some!', 'error');
        return;
      }
      
      // Check if user has enough balance
      if (amount > tokenBalance) {
        addToast(`Insufficient balance. You have ${formatEther(tokenBalance)} ZYL`, 'error');
        return;
      }
      
      // Check allowance
      if (!tokenAllowance || amount > tokenAllowance) {
        addToast('Please approve tokens first', 'error');
        return;
      }
      
      console.log('Calling stake with amount:', amount.toString());
      stakeTokens({
        ...STAKING_CONTRACT,
        functionName: 'stake',
        args: [amount]
      });
      addToast('Staking tokens...', 'info');
    } catch (error) {
      console.error('Staking error:', error);
      addToast(`Error: ${error.message || 'Invalid amount'}`, 'error');
    }
  };

  // Handle unstaking
  const handleUnstake = async () => {
    if (!unstakeAmount || !unstakeTokens) return;
    
    try {
      const amount = parseEther(unstakeAmount);
      unstakeTokens({
        ...STAKING_CONTRACT,
        functionName: 'unstake',
        args: [amount]
      });
      addToast('Unstaking tokens...', 'info');
    } catch (error) {
      console.error('Unstake error:', error);
      addToast('Invalid amount', 'error');
    }
  };

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    if (!claimRewards) return;
    
    claimRewards({
      ...STAKING_CONTRACT,
      functionName: 'claimRewards'
    });
    addToast('Claiming rewards...', 'info');
  };

  // Set max amounts
  const setMaxStake = () => {
    if (tokenBalance) {
      setStakeAmount(formatEther(tokenBalance));
    }
  };

  const setMaxUnstake = () => {
    if (userStakedBalance) {
      setUnstakeAmount(formatEther(userStakedBalance));
    }
  };

  // Toast notification system
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (isStakePending && !isStaking) {
      setIsStaking(true);
    }
    if (!isStakePending && isStaking) {
      setTimeout(() => {
        setIsStaking(false);
      }, 2000);
    }
  }, [isStakePending, isStaking]);

  useEffect(() => {
    if (isUnstakePending && !isUnstaking) {
      setIsUnstaking(true);
    }
    if (!isUnstakePending && isUnstaking) {
      setTimeout(() => {
        setIsUnstaking(false);
      }, 2000);
    }
  }, [isUnstakePending, isUnstaking]);

  useEffect(() => {
    if (isClaimPending && !isClaiming) {
      setIsClaiming(true);
    }
    if (!isClaimPending && isClaiming) {
      setTimeout(() => {
        setIsClaiming(false);
      }, 2000);
    }
  }, [isClaimPending, isClaiming]);

  const formatNumber = (value, decimals = 4) => {
    if (!value) return '0';
    try {
      return Number(formatEther(value)).toFixed(decimals);
    } catch {
      return '0';
    }
  };

  return (
    <section className="lg:py-24 py-0 px-3 sm:px-12 bg-[#0f1115] text-white font-body relative backdrop-blur-lg">
      <div className="relative z-10 lg:max-w-6xl mx-auto space-y-12">

        {/* Wallet Connection */}
        {!isConnected ? (
          <div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="text-center space-y-4">
              <div className="p-8 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyan-200 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-300 mb-6">Connect your wallet to start staking ZYL tokens</p>
                <ConnectButton.Custom>
                  {({ openConnectModal, mounted }) => {
                    if (!mounted) {
                      return <div>Loading...</div>;
                    }
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Connect Wallet
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="lg:w-10 lg:h-10 w-7 h-7  bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Coins className="lg:w-5 lg:h-5 w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-400 lg:text-sm text-xs">Your Staked</span>
                </div>
                <p className="text-2xl font-bold text-cyan-200">
                  {formatNumber(userStakedBalance)} {TOKEN_CONFIG.symbol}
                </p>
              </div>

              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="lg:w-10 lg:h-10 w-7 h-7 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="lg:w-5 lg:h-5 w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-400 lg:text-sm text-xs">Total Staked</span>
                </div>
                <p className="text-2xl font-bold text-fuchsia-200">
                  {formatNumber(totalStaked)} {TOKEN_CONFIG.symbol}
                </p>
              </div>

              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="lg:w-10 lg:h-10 w-7 h-7  bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="lg:w-5 lg:h-5 w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-400 lg:text-sm text-xs">Pending Rewards</span>
                </div>
                <p className="text-2xl font-bold text-yellow-200">
                  {formatNumber(pendingRewards)} {TOKEN_CONFIG.symbol}
                </p>
              </div>

              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="lg:w-10 lg:h-10 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Zap className="lg:w-5 lg:h-5 w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-400 lg:text-sm text-xs">Current APY</span>
                </div>
                <p className="text-2xl font-bold text-green-200">
                  {calculateAPY()}%
                </p>
              </div>
            </div>

            {/* Staking Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                    <ArrowUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-cyan-200">Stake Tokens</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-[#0a0b0f] border border-cyan-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={setMaxStake}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  
                  {/* Show balance info */}
                  <div className="text-sm text-gray-400 mb-2">
                    Balance: {tokenBalance !== undefined ? `${formatNumber(tokenBalance)} ZYL` : 'Loading...'}
                  </div>
                  
                  {/* Show approve button if needed, otherwise stake button */}
                  {stakeAmount && tokenAllowance !== undefined && parseEther(stakeAmount) > tokenAllowance ? (
                    <button
                      onClick={handleApprove}
                      disabled={!stakeAmount || isApproving || isApprovePending}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        !stakeAmount || isApproving || isApprovePending
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:scale-105'
                      }`}
                    >
                      {isApproving || isApprovePending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Approving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Approve {TOKEN_CONFIG.symbol}</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || isStaking || isStakePending || (stakeAmount && tokenBalance && parseEther(stakeAmount) > tokenBalance)}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        !stakeAmount || isStaking || isStakePending || (stakeAmount && tokenBalance && parseEther(stakeAmount) > tokenBalance)
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:scale-105'
                      }`}
                    >
                      {isStaking || isStakePending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Staking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <ArrowUp className="w-5 h-5" />
                          <span>Stake {TOKEN_CONFIG.symbol}</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Unstake Tokens */}
              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-full flex items-center justify-center">
                    <ArrowDown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-fuchsia-200">Unstake Tokens</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-[#0a0b0f] border border-fuchsia-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-400"
                    />
                    <button
                      onClick={setMaxUnstake}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 text-sm rounded-lg hover:bg-fuchsia-500/30 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  
                  <button
                    onClick={handleUnstake}
                    disabled={!unstakeAmount || isUnstaking || isUnstakePending}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      !unstakeAmount || isUnstaking || isUnstakePending
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white hover:scale-105'
                    }`}
                  >
                    {isUnstaking || isUnstakePending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Unstaking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <ArrowDown className="w-5 h-5" />
                        <span>Unstake {TOKEN_CONFIG.symbol}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Claim Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="lg:p-6 p-4 bg-[#0b0c10]/70 rounded-2xl border border-yellow-500/20 max-w-md w-full">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-yellow-200">Claim Rewards</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm">
                    Claim your accumulated staking rewards
                  </p>
                  
                  <button
                    onClick={handleClaimRewards}
                    disabled={!pendingRewards || Number(formatEther(pendingRewards || '0')) === 0 || isClaiming || isClaimPending}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      !pendingRewards || Number(formatEther(pendingRewards || '0')) === 0 || isClaiming || isClaimPending
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:scale-105'
                    }`}
                  >
                    {isClaiming || isClaimPending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Claiming...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Claim Rewards</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
      <AnimatePresence>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500/90 border border-green-400' :
              toast.type === 'error' ? 'bg-red-500/90 border border-red-400' :
              'bg-blue-500/90 border border-blue-400'
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-100" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-100" />}
              {toast.type === 'info' && <RefreshCw className="w-5 h-5 text-blue-100 animate-spin" />}
              <p className="text-white font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </AnimatePresence>
    </section>
  );
}
