'use client';

import { motion } from 'framer-motion';

const chains = [
  { name: 'Ethereum', tag: 'EVM', color: 'from-cyan-400 to-cyan-600' },
  { name: 'Polygon', tag: 'ZK', color: 'from-fuchsia-400 to-pink-500' },
  { name: 'Arbitrum', tag: 'EVM', color: 'from-blue-400 to-indigo-600' },
  { name: 'Optimism', tag: 'EVM', color: 'from-red-400 to-pink-500' },
  { name: 'Base', tag: 'EVM', color: 'from-sky-400 to-blue-500' },
  { name: 'Scroll', tag: 'ZK', color: 'from-yellow-300 to-orange-400' },
];

export default function ChainsSupported() {
  return (
    <section className="py-24 px-6 sm:px-12 bg-[#0f1115] text-white font-body relative backdrop-blur-lg">
      {/* 💫 Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* 🧠 Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 bg-clip-text drop-shadow-lg">
            Supported Blockchains
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Zelion is live across major EVM and zk-rollup chains.
          </p>
        </motion.div>

        {/* 🌐 Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center"
        >
          {chains.map((chain, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.08 }}
              className="flex flex-col items-center p-5 bg-[#0b0c10]/70 rounded-2xl border border-cyan-500/10 hover:border-cyan-400/30 shadow-md hover:shadow-cyan-400/20 transition-all duration-300 relative group"
            >
              {/* 🌀 Animated Circle */}
              <div
                className={`mb-4 w-14 h-14 rounded-full bg-gradient-to-br ${chain.color} animate-pulse shadow-inner shadow-cyan-700/20`}
              />

              {/* 🏷️ Name */}
              <h4 className="text-md font-heading text-cyan-200">{chain.name}</h4>

              {/* 🔖 Tag */}
              <span className="text-xs bg-cyan-300 text-black font-semibold mt-1 px-2 py-0.5 rounded-full">
                {chain.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* 📊 Footer */}
        <div className="text-center mt-10 text-sm text-gray-400">
          <p>
            <span className="text-cyan-300 font-bold">{chains.length}</span> Chains Integrated |{' '}
            <span className="text-cyan-300 font-bold">Omnichain Ready</span>
          </p>
        </div>
      </div>
    </section>
  );
}
