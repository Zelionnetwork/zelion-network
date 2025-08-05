'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletModal() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Optional: Auto redirect if connected
  useEffect(() => {
    if (isConnected) {
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isConnected]);

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-[#0f1115] border border-cyan-500/20 rounded-xl p-10 shadow-lg backdrop-blur-md">
        <h2 className="text-2xl font-heading text-center mb-6 text-cyan-300">
          {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
        </h2>
        {!isConnected && <ConnectButton showBalance={false} />}
      </div>
    </div>
  );
}
