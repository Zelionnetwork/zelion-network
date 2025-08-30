'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { FiCopy, FiCheckCircle, FiGlobe, FiShield } from 'react-icons/fi';

export default function DashboardPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [copied, setCopied] = useState(false);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);

  const supportedChains = [
    { id: 1, name: 'Ethereum Mainnet' },
    { id: 137, name: 'Polygon' },
    { id: 42161, name: 'Arbitrum' },
    { id: 10, name: 'Optimism' },
    { id: 421614, name: 'Arbitrum Sepolia' },
    { id: 80002, name: 'Polygon Amoy' },
  ];

  const { chains, switchChain } = useSwitchChain();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchNetwork = (e) => {
    const id = Number(e.target.value);
    const target = chains.find((c) => c.id === id);
    if (target) switchChain({ chainId: target.id });
  };

  const getNetworkName = () => {
    const chain = supportedChains.find((c) => c.id === chainId);
    return chain ? chain.name : `Unknown (${chainId})`;
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-300 py-6 sm:py-8">
        <FiShield className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
        <p className="text-xs sm:text-sm">Please connect your wallet to view dashboard information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Wallet Address */}
      <div className="bg-[#0a0b0f] p-3 sm:p-4 rounded-lg border border-cyan-400/20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">Wallet Address:</p>
          <button
            onClick={handleCopy}
            className="text-cyan-400 text-xs flex items-center gap-1 hover:underline"
          >
            {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p
          className={`text-xs sm:text-sm font-mono break-all text-cyan-100 ${
            privacyEnabled ? 'blur-sm' : ''
          }`}
        >
          {address}
        </p>
      </div>

      {/* Network Info */}
      <div className="bg-[#0a0b0f] p-3 sm:p-4 rounded-lg border border-cyan-400/20">
        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
          <FiGlobe className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
          <p className="text-xs text-gray-400">Current Network:</p>
        </div>
        <p
          className={`text-xs sm:text-sm font-semibold text-cyan-200 mb-2 sm:mb-3 ${
            privacyEnabled ? 'blur-sm' : ''
          }`}
        >
          {getNetworkName()}
        </p>
        
        {/* Network Switcher */}
        <div>
          <label className="text-xs text-cyan-200 block mb-1 sm:mb-2">Switch Network:</label>
          <select
            onChange={handleSwitchNetwork}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none text-xs sm:text-sm"
          >
            <option value="">Select network</option>
            {supportedChains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="bg-[#0a0b0f] p-3 sm:p-4 rounded-lg border border-cyan-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiShield className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm text-gray-300">Privacy Mode</span>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={privacyEnabled}
              onChange={() => setPrivacyEnabled(!privacyEnabled)}
            />
            <div className="w-6 h-3 sm:w-8 sm:h-4 bg-gray-600 rounded-full peer dark:bg-gray-700 transition relative">
              <div
                className={`absolute left-0.5 top-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full transition-transform ${
                  privacyEnabled ? 'translate-x-3 sm:translate-x-4' : ''
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-[#0a0b0f] p-3 sm:p-4 rounded-lg border border-green-400/20">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm text-green-400 font-medium">Connected</span>
        </div>
      </div>
    </div>
  );
}
