'use client';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import CallToAction from './components/CallToAction';
import StatsSection from './components/StatsSection';
import ChainsSupported from './components/ChainsSupported';
import Footer from './components/Footer';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      <StatsSection />
      <ChainsSupported />

      {/* ✅ Floating Wallet Connect if NOT connected */}
      {!isConnected && (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="fixed bottom-5 right-5 z-50 px-5 py-3 bg-brand text-black font-bold rounded-full shadow-lg hover:bg-white transition-all duration-300 cursor-pointer animate-pulse"
            >
              Connect a Wallet
            </button>
          )}
        </ConnectButton.Custom>
      )}

      <Footer />
    </>
  );
}
