'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function BridgePanel() {
  const [fromChain, setFromChain] = useState('Arbitrum Sepolia');
  const [toChain, setToChain] = useState('Polygon Amoy');
  const [selectedToken, setSelectedToken] = useState('ZYL');
  const [userEmail, setUserEmail] = useState('');
  const [sent, setSent] = useState(false);

  const supportedChains = [
    'Arbitrum One',
    'Arbitrum Sepolia',
    'Polygon',
    'Polygon Amoy',
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

  const handleJoinWaitlist = () => {
    window.open('https://mailchi.mp/763cb178e081/zelion-network', '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
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
          <label className="text-sm text-cyan-200 block mb-1 mt-4">Your Email (optional)</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 bg-black/30 text-white border border-cyan-500/20 rounded-lg focus:outline-none"
          />
        </div>

        <p className="text-sm text-cyan-100 mt-6">
          Bridging is not yet live. Join our waitlist and we’ll notify you when it's ready.
        </p>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleJoinWaitlist}
            className="btn-zelion w-full sm:w-auto flex items-center justify-center gap-2"
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
