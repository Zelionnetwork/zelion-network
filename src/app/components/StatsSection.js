'use client';

import { useEffect, useState } from 'react';
import { FiActivity, FiZap, FiTrendingUp } from 'react-icons/fi';

export default function StatsSection() {
  const [stats, setStats] = useState({
    tps: 4000,
    messages: 2000000,
    value: 2500000,
  });

  // Simulate live updates (replace with real API later)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        tps: Math.min(prev.tps + Math.random() * 10, 4300),
        messages: prev.messages + Math.floor(Math.random() * 100),
        value: prev.value + Math.random() * 100000,
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      title: 'Live TPS',
      value: Math.round(stats.tps).toLocaleString('en-US'), // ✅ Fixed: Force en-US
      icon: <FiZap className="text-cyan-400 text-2xl" />,
      desc: 'Current transactions per second across chains.',
    },
    {
      title: 'Total Messages',
      value: stats.messages.toLocaleString('en-US'), // ✅ Fixed: Force en-US
      icon: <FiActivity className="text-cyan-400 text-2xl" />,
      desc: 'Cross-chain messages relayed since genesis.',
    },
    {
      title: 'Value Transferred',
      value: `$${stats.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD`, // ✅ Fixed: Force en-US with decimals
      icon: <FiTrendingUp className="text-cyan-400 text-2xl" />,
      desc: 'Total assets bridged securely via Zelion.',
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-12 bg-[#0f1115]/85 backdrop-blur-md text-white font-body relative">
      {/* 🌀 Glow BG Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto z-10 relative space-y-16">
        {/* 🧠 Header */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text drop-shadow">
            Real-Time Stats
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A glimpse into Zelion’s live network activity across supported chains.
          </p>
        </div>

        {/* 📊 Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              className="glass p-6 rounded-xl border border-cyan-400/10 hover:border-cyan-300/30 shadow-xl transition-all duration-300 hover:bg-cyan-400/5 text-center group"
            >
              <div className="flex justify-center items-center w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-400/10">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-cyan-200 group-hover:text-white transition">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
