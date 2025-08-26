import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import swapService from '../services/swapService';

export const useSwap = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});

  // Initialize swap service
  const initializeService = useCallback(() => {
    if (publicClient && walletClient) {
      swapService.setProvider(publicClient, walletClient);
    }
  }, [publicClient, walletClient]);

  // Auto-initialize service when clients are available
  useEffect(() => {
    if (publicClient && walletClient) {
      console.log('Initializing swap service with clients:', { publicClient: !!publicClient, walletClient: !!walletClient });
      initializeService();
    }
  }, [initializeService, publicClient, walletClient]);

  // Get token balance
  const getTokenBalance = useCallback(async (tokenSymbol) => {
    if (!isConnected || !address || !chainId || !publicClient) return;

    try {
      setIsLoading(true);
      setError('');

      // Ensure service is initialized
      if (!swapService.publicClient) {
        swapService.setProvider(publicClient, walletClient);
      }

      const tokenAddresses = swapService.getTokenAddresses(chainId);
      const tokenAddress = tokenAddresses[tokenSymbol] || '0x0000000000000000000000000000000000000000';
      
      const balance = await swapService.getTokenBalance(tokenAddress, address);
      const decimals = swapService.getTokenDecimals(tokenSymbol);
      const formattedBalance = swapService.formatTokenAmount(balance, decimals);

      setTokenBalances(prev => ({
        ...prev,
        [tokenSymbol]: {
          raw: balance,
          formatted: formattedBalance,
          decimals: decimals,
        }
      }));

      return formattedBalance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      setError(`Failed to get ${tokenSymbol} balance`);
      return '0';
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, publicClient, walletClient]);

  // Get swap quote
  const getSwapQuote = useCallback(async (fromToken, toToken, amount) => {
    if (!fromToken || !toToken || !amount || amount <= 0) {
      setQuote(null);
      return null;
    }

    try {
      setIsLoading(true);
      setError('');

      const quote = await swapService.getSwapQuote(fromToken, toToken, parseFloat(amount), chainId);
      setQuote(quote);
      return quote;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      setError('Failed to get swap quote');
      setQuote(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  // Check token allowance
  const checkTokenAllowance = useCallback(async (tokenSymbol, spenderAddress) => {
    if (!isConnected || !address || !chainId || !publicClient) return false;

    try {
      // Ensure service is initialized
      if (!swapService.publicClient) {
        swapService.setProvider(publicClient, walletClient);
      }

      const tokenAddresses = swapService.getTokenAddresses(chainId);
      const tokenAddress = tokenAddresses[tokenSymbol] || '0x0000000000000000000000000000000000000000';
      
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        return true; // ETH doesn't need allowance
      }

      const allowance = await swapService.getTokenAllowance(tokenAddress, address, spenderAddress);
      return allowance > 0;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return false;
    }
  }, [isConnected, address, chainId, publicClient, walletClient]);

  // Approve token
  const approveToken = useCallback(async (tokenSymbol, spenderAddress, amount) => {
    if (!isConnected || !address || !chainId || !walletClient) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsLoading(true);
      setError('');

      // Ensure service is initialized
      if (!swapService.walletClient) {
        swapService.setProvider(publicClient, walletClient);
      }

      const tokenAddresses = swapService.getTokenAddresses(chainId);
      const tokenAddress = tokenAddresses[tokenSymbol] || '0x0000000000000000000000000000000000000000';
      
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        return { success: true }; // ETH doesn't need approval
      }

      const decimals = swapService.getTokenDecimals(tokenSymbol);
      const amountWei = swapService.parseTokenAmount(amount, decimals);

      const result = await swapService.approveToken(tokenAddress, spenderAddress, amountWei);
      return result;
    } catch (error) {
      console.error('Error approving token:', error);
      const errorMessage = error.message || 'Failed to approve token';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, publicClient, walletClient]);

  // Execute swap
  const executeSwap = useCallback(async (fromToken, toToken, amount, slippage) => {
    if (!isConnected || !address || !chainId || !walletClient) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsLoading(true);
      setError('');

      // Ensure service is initialized
      if (!swapService.walletClient) {
        swapService.setProvider(publicClient, walletClient);
      }

      const result = await swapService.executeSwap(
        fromToken,
        toToken,
        parseFloat(amount),
        slippage,
        address,
        chainId
      );

      if (result.success) {
        // Refresh balances after successful swap
        await getTokenBalance(fromToken);
        await getTokenBalance(toToken);
      }

      return result;
    } catch (error) {
      console.error('Error executing swap:', error);
      const errorMessage = error.message || 'Swap execution failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, publicClient, walletClient, getTokenBalance]);

  // Get supported tokens for current chain
  const getSupportedTokens = useCallback(() => {
    return swapService.getSupportedTokens(chainId);
  }, [chainId]);

  // Get tokens from faucet
  const getTokensFromFaucet = useCallback(async (tokenSymbol) => {
    if (!isConnected || !address || !chainId || !walletClient) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setIsLoading(true);
      setError('');

      // Ensure service is initialized
      if (!swapService.walletClient) {
        swapService.setProvider(publicClient, walletClient);
      }

      const result = await swapService.getTokensFromFaucet(tokenSymbol, address, chainId);

      if (result.success) {
        // Refresh balance after successful faucet request
        await getTokenBalance(tokenSymbol);
      }

      return result;
    } catch (error) {
      console.error('Error requesting from faucet:', error);
      const errorMessage = error.message || 'Faucet request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, publicClient, walletClient, getTokenBalance]);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setQuote(null);
    setError('');
    setTokenBalances({});
  }, []);

  return {
    // State
    isLoading,
    error,
    quote,
    tokenBalances,
    
    // Actions
    getTokenBalance,
    getSwapQuote,
    checkTokenAllowance,
    approveToken,
    executeSwap,
    getSupportedTokens,
    getTokensFromFaucet,
    clearError,
    reset,
    
    // Utils
    isConnected,
    chainId,
    address,
  };
};
