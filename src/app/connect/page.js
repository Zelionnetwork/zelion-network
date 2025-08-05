'use client';

import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import WalletModal from '../components/WalletModal';

export default function ConnectPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-[#0f1115] text-white font-body flex flex-col items-center justify-center pt-24">
        {/* 🔐 Wallet Connect UI */}
        <WalletModal />
      </div>
    </>
  );
}
