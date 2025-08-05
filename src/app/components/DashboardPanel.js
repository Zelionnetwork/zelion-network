'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';

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

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0f1115]/80 text-white font-body relative">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#00f0ff0d] to-transparent pointer-events-none" />

      <div className="max-w-xl w-full glass rounded-xl p-8 shadow-xl border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-heading text-cyan-300 tracking-wide">Dashboard</h2>

          {/* 🛡️ Privacy Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Privacy</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={privacyEnabled}
                onChange={() => setPrivacyEnabled(!privacyEnabled)}
              />
              <div className="w-10 h-5 bg-gray-600 rounded-full peer dark:bg-gray-700 transition relative">
                <div
                  className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    privacyEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-6">
            {/* 🔗 Wallet Address */}
            <div className="bg-[#0b0c10] p-5 rounded-lg border border-cyan-400/20 hover:border-cyan-300/40 transition duration-300">
              <p className="text-sm text-gray-400 mb-1">Connected Wallet:</p>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm sm:text-md font-mono break-all text-cyan-100 ${
                    privacyEnabled ? 'blur-sm' : ''
                  }`}
                >
                  {address}
                </p>
                <button
                  onClick={handleCopy}
                  className="text-cyan-400 text-sm flex items-center gap-1 hover:underline"
                >
                  {copied ? <FiCheckCircle className="text-green-400" /> : <FiCopy />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* 🌐 Network Info */}
            <div className="bg-[#0b0c10] p-5 rounded-lg border border-cyan-400/20 hover:border-cyan-300/40 transition duration-300 space-y-2">
              <div>
                <p className="text-sm text-gray-400 mb-1">Connected Network:</p>
                <p
                  className={`text-md font-semibold text-cyan-200 ${
                    privacyEnabled ? 'blur-sm' : ''
                  }`}
                >
                  {getNetworkName()}
                </p>
              </div>

              {/* 🔁 Change Network Dropdown */}
              <div>
                <label className="text-sm text-cyan-200 block mb-1">Change Network</label>
                <select
                  onChange={handleSwitchNetwork}
                  className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
                >
                  <option value="">Select a network</option>
                  {supportedChains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Status Info */}
            <div className="bg-[#0b0c10] p-5 rounded-lg border border-cyan-400/20 hover:border-cyan-300/40 transition duration-300">
              <p className="text-sm text-gray-400 mb-1">Connection Status:</p>
              <div className="flex items-center gap-2 text-green-400 font-bold text-md">
                <FiCheckCircle className="text-green-400" />
                Connected
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-300">
            <p className="mb-4">You're not connected yet.</p>
            <p className="text-sm text-cyan-400">
              Please connect your wallet to access the dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
