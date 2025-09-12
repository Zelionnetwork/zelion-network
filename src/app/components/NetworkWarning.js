'use client';
import { useChainId, useSwitchChain } from 'wagmi';
import { AlertTriangle } from 'lucide-react';

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export default function NetworkWarning() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) {
    return null;
  }
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div className="bg-red-900/90 backdrop-blur-md border border-red-500 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-200 font-semibold mb-1">Wrong Network</h3>
            <p className="text-red-300 text-sm mb-3">
              You're connected to mainnet which has high fees. Please switch to Arbitrum Sepolia testnet for testing.
            </p>
            <button
              onClick={() => switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Switch to Arbitrum Sepolia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
