import { useCallback, useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient, useChainId, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from '../../contracts/addresses';

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
  },
  {
    name: 'lastRequestTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'COOLDOWN_TIME',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  }
];

// Token ABI for balance checking
const TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  }
];

export const useFaucet = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  const faucetAddress = chainId ? CONTRACT_ADDRESSES[chainId]?.Faucet : null;
  const tokenAddress = chainId ? TOKEN_ADDRESSES[chainId]?.ZYL : null;
  const hasFaucet = faucetAddress && faucetAddress !== '0x0000000000000000000000000000000000000000';

  // Debug logging - commented out to reduce console spam
  // console.log('useFaucet Hook State:', {
  //   address,
  //   isConnected,
  //   chainId,
  //   publicClient: !!publicClient,
  // });

  // Read user's token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    watch: true,
    enabled: !!address && !!tokenAddress,
    cacheTime: 0, // Disable caching to ensure fresh data
    staleTime: 0, // Consider data stale immediately
  });

  // Read last request time from contract
  const { data: lastRequestTimeContract, refetch: refetchLastRequestTime } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: 'lastRequestTime',
    args: address ? [address] : undefined,
    watch: true,
    enabled: !!address && !!faucetAddress,
  });

  // Read cooldown time constant from contract
  const { data: cooldownTimeConstant } = useReadContract({
    address: faucetAddress,
    abi: FAUCET_ABI,
    functionName: 'COOLDOWN_TIME',
    watch: false,
    enabled: !!faucetAddress,
  });

  // Calculate remaining cooldown time
  useEffect(() => {
    if (lastRequestTimeContract && cooldownTimeConstant) {
      const lastTime = Number(lastRequestTimeContract);
      const cooldown = Number(cooldownTimeConstant);
      
      if (lastTime > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timePassed = currentTime - lastTime;
        const remaining = Math.max(0, cooldown - timePassed);
        
        setCooldownTime(remaining * 1000); // Convert to milliseconds
        
        if (remaining > 0) {
          const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const elapsed = now - lastTime;
            const timeLeft = Math.max(0, cooldown - elapsed);
            setCooldownTime(timeLeft * 1000);
            
            if (timeLeft === 0) {
              clearInterval(interval);
            }
          }, 1000);
          
          return () => clearInterval(interval);
        }
      } else {
        setCooldownTime(0);
      }
    } else {
      setCooldownTime(0);
    }
  }, [lastRequestTimeContract, cooldownTimeConstant]);

  const requestTokens = useCallback(async () => {
    if (!isConnected || !address || !walletClient || !publicClient || !faucetAddress) {
      setError('Please connect your wallet and ensure you are on a supported chain');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // For this faucet, we just call requestTokens() with no parameters
      // The faucet has the ZYL token hardcoded internally
      console.log('Requesting tokens from faucet:', faucetAddress);
      
      const hash = await walletClient.writeContract({
        address: faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'requestTokens',
        args: [],
        gas: 300000n, // Increased gas limit
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setSuccess({
          hash: hash,
          message: `Successfully requested tokens from faucet!`
        });
        setLastRequestTime(Date.now());
        
        // Refresh balance and cooldown data after successful transaction
        // Multiple refresh attempts to ensure data updates
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 1000); // First refresh after 1 second
        
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 3000); // Second refresh after 3 seconds
        
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 5000); // Third refresh after 5 seconds
        
        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(null), 10000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Faucet request failed:', err);
      // Handle specific error messages
      if (err.message?.includes('24 hours')) {
        setError('Please wait 24 hours between faucet requests');
      } else if (err.message?.includes('empty')) {
        setError('Faucet is empty. Please contact admin to refill.');
      } else {
        setError(err.message || 'Failed to request tokens from faucet');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, walletClient, publicClient, faucetAddress]);

  const requestSpecificTokens = useCallback(async (tokenAddress, amount) => {
    if (!isConnected || !address || !walletClient || !publicClient || !faucetAddress) {
      setError('Please connect your wallet and ensure you are on a supported chain');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Request specific tokens from faucet
      // The contract will handle cooldown validation
      const hash = await walletClient.writeContract({
        address: faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'requestTokens',
        args: [tokenAddress, amount],
        value: 0n, // Explicitly set value to 0 to avoid sending ETH
        gas: 200000n, // Set reasonable gas limit
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setSuccess({
          hash: hash,
          message: `Successfully requested tokens from faucet!`
        });
        setLastRequestTime(Date.now());
        
        // Refresh balance and cooldown data after successful transaction
        // Multiple refresh attempts to ensure data updates
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 1000); // First refresh after 1 second
        
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 3000); // Second refresh after 3 seconds
        
        setTimeout(() => {
          refetchBalance();
          refetchLastRequestTime();
        }, 5000); // Third refresh after 5 seconds
        
        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(null), 10000);
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Faucet request failed:', err);
      // Handle specific error messages
      if (err.message?.includes('24 hours')) {
        setError('Please wait 24 hours between faucet requests');
      } else if (err.message?.includes('empty')) {
        setError('Faucet is empty. Please contact admin to refill.');
      } else {
        setError(err.message || 'Failed to request tokens from faucet');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, walletClient, publicClient, faucetAddress]);

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
    tokenBalance,

    // Actions
    requestTokens,
    requestSpecificTokens,
    clearMessages,
    reset,
  };
};
