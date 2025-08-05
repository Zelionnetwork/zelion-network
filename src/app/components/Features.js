'use client';

import { FiShield, FiGlobe, FiEyeOff } from 'react-icons/fi';

export default function Features() {
  const features = [
    {
      title: 'Quantum Security',
      desc: 'Unbreakable by classical or quantum computers.',
      icon: <FiShield className="text-cyan-300 text-3xl mb-4" />,
    },
    {
      title: 'Cross-Chain',
      desc: 'Supports EVM & non-EVM with zero friction.',
      icon: <FiGlobe className="text-cyan-300 text-3xl mb-4" />,
    },
    {
      title: 'zk-Powered Privacy',
      desc: 'Built-in ZK proof-based compliance & privacy.',
      icon: <FiEyeOff className="text-cyan-300 text-3xl mb-4" />,
    },
  ];

  return (
    <section
      id="features"
      className="py-24 px-6 sm:px-10 bg-[#0f1115]/90 backdrop-blur-md relative"
    >
      <h3 className="text-4xl font-heading text-center text-cyan-300 mb-16 tracking-wide">
        Key Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="group relative glass rounded-xl p-6 border border-cyan-400/10 shadow-xl transition-transform duration-300 hover:scale-[1.04] hover:border-cyan-400/20 hover:bg-cyan-400/5 text-center"
          >
            {/* Glowing bottom border effect */}
            <div className="absolute left-1/2 -bottom-0.5 w-0 h-[2px] bg-cyan-400 transition-all duration-500 group-hover:w-[80%] group-hover:left-[10%]" />

            {item.icon}
            <h4 className="text-xl font-heading text-cyan-300 mb-2 tracking-wide">
              {item.title}
            </h4>
            <p className="text-gray-300 font-body text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
