'use client';

import { useEffect } from 'react';
import WalletModal from '../components/WalletModal';

export default function ConnectPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="relative min-h-screen bg-[#0f1115] text-white font-body flex flex-col items-center justify-center">
        {/* 🔐 Wallet Connect UI */}
        <WalletModal />
      </div>
    </>
  );
}
