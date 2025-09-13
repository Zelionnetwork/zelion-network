'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';

export default function Hero() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .shader-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -2;
        background: radial-gradient(ellipse at top left, rgba(0,240,255,0.04), transparent),
                    radial-gradient(ellipse at bottom right, rgba(255,255,255,0.015), transparent);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center px-6 sm:px-12 overflow-hidden"
    >
      {/* ✨ Shader Overlay (for soft glow) */}
      <div className="shader-overlay" />

      {/* 🧊 Spline 3D Orb */}
      <div className="absolute inset-0 scale-[1.05] w-full h-full z-[1]">
        <iframe
          src="https://my.spline.design/reactiveorb-oo9h0nSlpuw6rqVUteGcjoPM"
          frameBorder="0"
          allow="autoplay; fullscreen"
          loading="lazy"
          decoding="async"
          className="w-full h-full"
        ></iframe>
      </div>

      {/* 🚀 Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        className="z-10 max-w-3xl space-y-6"
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl md:text-6xl font-heading font-bold bg-gradient-to-r from-cyan-300 via-white to-cyan-400 bg-clip-text text-transparent drop-shadow-xl"
        >
          Zelion Chain
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-gray-300 max-w-xl text-lg font-body"
        >
          Elevate blockchain security to quantum levels. Seamless privacy. Limitless cross-chain performance.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-zelion"
            onClick={() => router.push(isConnected ? '/dashboard' : '/connect')}
          >
            {isConnected ? 'Go to Dashboard' : 'Enter the Portal'}
          </motion.button>

          <motion.a
            href="https://sepolia.arbiscan.io/address/0x8283cf56a04cB83b5E10F215d93E6710E313b06e"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="btn-zelion bg-transparent border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black"
          >
            View Sepolia Testnet ↗
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
