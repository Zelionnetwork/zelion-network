import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import BlockchainService from '../services/blockchainService';

export const useBridge = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [blockchainService, setBlockchainService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feeEstimate, setFeeEstimate] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [allowance, setAllowance] = useState(null);

  const initializeService = useCallback(async () => {
    if (!publicClient || !walletClient) {
      setError('Public client or wallet client not available');
      return false;
    }

    try {
      const service = new BlockchainService();
      await service.initialize(publicClient, walletClient);
      setBlockchainService(service);
      setError(null);
      return true;
    } catch (err) {
      setError(`Failed to initialize blockchain service: ${err.message}`);
      return false;
    }
  }, [publicClient, walletClient]);

  const estimateFee = useCallback(async (fromChain, toChain, amount) => {
    if (!blockchainService) {
      const initialized = await initializeService();
      if (!initialized) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.estimateBridgeFee(fromChain, toChain, amount);
      
      if (result.success) {
        setFeeEstimate(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to estimate fee: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [blockchainService, initializeService]);

  const getTokenBalance = useCallback(async (chainName) => {
    if (!blockchainService || !address) return;

    try {
      const result = await blockchainService.getTokenBalance(chainName, address);
      
      if (result.success) {
        setTokenBalance(result.balance);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to get token balance: ${err.message}`);
    }
  }, [blockchainService, address]);

  const approveTokens = useCallback(async (chainName, amount) => {
    if (!blockchainService) {
      const initialized = await initializeService();
      if (!initialized) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.approveTokenSpending(chainName, amount);
      
      if (result.success) {
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMsg = `Failed to approve tokens: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [blockchainService, initializeService]);

  const bridgeTokens = useCallback(async (fromChain, toChain, amount, receiverAddress) => {
    if (!blockchainService) {
      const initialized = await initializeService();
      if (!initialized) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.bridgeTokens(fromChain, toChain, amount, receiverAddress);
      
      if (result.success) {
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMsg = `Failed to bridge tokens: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [blockchainService, initializeService]);

  const executeBridge = useCallback(async (fromChain, toChain, amount, receiverAddress) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!blockchainService) {
        const initialized = await initializeService();
        if (!initialized) return;
      }

      const feeResult = await blockchainService.estimateBridgeFee(fromChain, toChain, amount);
      if (!feeResult.success) {
        setError(feeResult.error);
        return;
      }

      const approveResult = await blockchainService.approveTokenSpending(fromChain, amount);
      if (!approveResult.success) {
        setError(approveResult.error);
        return;
      }

      const bridgeResult = await blockchainService.bridgeTokens(fromChain, toChain, amount, receiverAddress);
      if (!bridgeResult.success) {
        setError(bridgeResult.error);
        return;
      }

      return bridgeResult;
    } catch (err) {
      setError(`Bridge execution failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [blockchainService, isConnected, address, initializeService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setFeeEstimate(null);
    setTokenBalance(null);
    setAllowance(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    feeEstimate,
    tokenBalance,
    allowance,
    isConnected,
    address,

    estimateFee,
    getTokenBalance,
    approveTokens,
    bridgeTokens,
    executeBridge,
    clearError,
    reset,
    initializeService,
  };
};
