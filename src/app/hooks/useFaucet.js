import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';

// Faucet contract addresses for different chains
const FAUCET_ADDRESSES = {
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet - No faucet
  137: '0x0000000000000000000000000000000000000000', // Polygon - No faucet
  42161: '0x0000000000000000000000000000000000000000', // Arbitrum One - No faucet
  10: '0x0000000000000000000000000000000000000000', // Optimism - No faucet
  8453: '0x0000000000000000000000000000000000000000', // Base - No faucet
  534352: '0x0000000000000000000000000000000000000000', // Scroll - No faucet
  // Testnets with faucets
  421614: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0', // Arbitrum Sepolia
  80002: '0x0000000000000000000000000000000000000000', // Polygon Amoy - Add faucet address
  11155111: '0x0000000000000000000000000000000000000000', // Ethereum Sepolia - Add faucet address
  84532: '0x0000000000000000000000000000000000000000', // Base Sepolia - Add faucet address
};

// Faucet ABI for requesting native tokens
const FAUCET_ABI = [
  {
    name: 'requestNativeTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'requestTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
  }
];

export const useFaucet = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Debug logging
  console.log('useFaucet Hook State:', {
    address,
    isConnected,
    chainId,
    publicClient: !!publicClient,
    walletClient: !!walletClient
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  const faucetAddress = chainId ? FAUCET_ADDRESSES[chainId] : null;
  const hasFaucet = faucetAddress && faucetAddress !== '0x0000000000000000000000000000000000000000';

  const requestTokens = useCallback(async () => {
    if (!isConnected || !address || !walletClient || !publicClient || !faucetAddress) {
      setError('Please connect your wallet and ensure you are on a supported chain');
      return false;
    }

    if (cooldownTime > 0) {
      setError('Please wait for the cooldown period to end before requesting more tokens');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Request native tokens from faucet
      const hash = await walletClient.writeContract({
        address: faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'requestNativeTokens',
        args: [],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setSuccess({
          hash: hash,
          message: `Successfully requested tokens from faucet!`
        });
        setLastRequestTime(Date.now());
        
        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(null), 10000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Faucet request failed:', err);
      setError(err.message || 'Failed to request tokens from faucet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, walletClient, publicClient, faucetAddress, cooldownTime]);

  const requestSpecificTokens = useCallback(async (tokenAddress, amount) => {
    if (!isConnected || !address || !walletClient || !publicClient || !faucetAddress) {
      setError('Please connect your wallet and ensure you are on a supported chain');
      return false;
    }

    if (cooldownTime > 0) {
      setError('Please wait for the cooldown period to end before requesting more tokens');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Request specific tokens from faucet
      const hash = await walletClient.writeContract({
        address: faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'requestTokens',
        args: [tokenAddress, amount],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setSuccess({
          hash: hash,
          message: `Successfully requested tokens from faucet!`
        });
        setLastRequestTime(Date.now());
        
        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(null), 10000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Faucet request failed:', err);
      setError(err.message || 'Failed to request tokens from faucet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, walletClient, publicClient, faucetAddress, cooldownTime]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    success,
    lastRequestTime,
    cooldownTime,
    currentChainId: chainId,
    faucetAddress,
    hasFaucet,
    isConnected,
    address,

    // Actions
    requestTokens,
    requestSpecificTokens,
    clearMessages,
    reset,
  };
};
