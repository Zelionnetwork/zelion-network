'use client';
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import BlockchainService from '../services/blockchainService';

export default function BridgeTest() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testContractConnection = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize blockchain service
      const service = new BlockchainService();
      await service.initialize(provider, signer);

      // Test 1: Check if bridge contract is accessible
      const bridgeContract = service.bridgeContract;
      const isPaused = await bridgeContract.isPaused();
      
      // Test 2: Check token contract
      const tokenContract = service.getTokenContract('Arbitrum Sepolia');
      const tokenBalance = await tokenContract.balanceOf(address);
      
      // Test 3: Check allowance
      const allowance = await tokenContract.allowance(address, '0xC882b481478F2431c29518932A52978dfb7407E1');

      setResult({
        bridgeContract: 'Connected',
        isPaused: isPaused.toString(),
        tokenBalance: ethers.formatEther(tokenBalance),
        allowance: ethers.formatEther(allowance),
        chainId: chainId.toString(),
        userAddress: address
      });

    } catch (err) {
      setError(`Test failed: ${err.message}`);
      console.error('Test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black/20 rounded-lg border border-cyan-500/20">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Bridge Contract Test</h3>
      
      <button
        onClick={testContractConnection}
        disabled={isLoading}
        className="btn-zelion mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Contract Connection'}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
          <h4 className="text-cyan-300 font-semibold mb-2">Test Results:</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-cyan-200">Bridge Contract:</span> {result.bridgeContract}</p>
            <p><span className="text-cyan-200">Is Paused:</span> {result.isPaused}</p>
            <p><span className="text-cyan-200">Token Balance:</span> {result.tokenBalance} ZYL</p>
            <p><span className="text-cyan-200">Allowance:</span> {result.allowance} ZYL</p>
            <p><span className="text-cyan-200">Chain ID:</span> {result.chainId}</p>
            <p><span className="text-cyan-200">User Address:</span> {result.userAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
