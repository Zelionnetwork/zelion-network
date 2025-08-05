'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function EmergencyPanel() {
  const { address, isConnected } = useAccount();
  const [isPaused, setIsPaused] = useState(false);

  const adminAddress = '0x07B2CfBe1bd51325a8bFbE9399AAB494420111E1'.toLowerCase(); // 🔒 Replace if needed
  const isAdmin = isConnected && address?.toLowerCase() === adminAddress;

  const handlePause = () => {
    console.log('⏸ Contract paused');
    setIsPaused(true);
  };

  const handleUnpause = () => {
    console.log('▶️ Contract unpaused');
    setIsPaused(false);
  };

  const handleWithdraw = () => {
    console.log('💸 ETH withdrawn');
  };

  if (!isAdmin) return null;

  return (
    <section className="min-h-screen py-20 px-6 sm:px-12 bg-[#0f1115]/80 text-white font-body relative">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#ff00330d] to-transparent pointer-events-none" />

      <h2 className="text-3xl font-heading text-red-400 text-center mb-10">
        Emergency Controls (Admin Only)
      </h2>

      <div className="glass max-w-2xl mx-auto p-8 rounded-xl shadow-xl border border-red-500/20 backdrop-blur-md space-y-6">
        <div className="text-sm text-gray-400">
          Admin Address:{' '}
          <span className="text-white break-all font-mono">{address}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={handlePause}
            disabled={isPaused}
            className="btn-zelion w-full sm:w-auto bg-red-500 hover:bg-red-400 disabled:opacity-50"
          >
            Pause Contract
          </button>

          <button
            onClick={handleUnpause}
            disabled={!isPaused}
            className="btn-zelion w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black disabled:opacity-50"
          >
            Unpause Contract
          </button>

          <button
            onClick={handleWithdraw}
            className="btn-zelion w-full sm:w-auto"
          >
            Withdraw ETH
          </button>
        </div>
      </div>
    </section>
  );
}
