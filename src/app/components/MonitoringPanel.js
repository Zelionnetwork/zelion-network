'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc'); // Arbitrum Sepolia

export default function MonitoringPanel() {
  const [tps, setTps] = useState('-');
  const [gas, setGas] = useState('-');
  const [uptime, setUptime] = useState('99.9999'); // Still simulated

  useEffect(() => {
    let lastBlock = null;
    let lastTime = null;

    const fetchMetrics = async () => {
      try {
        const block = await provider.getBlock('latest');
        const fee = await provider.getFeeData();

        if (lastBlock && lastTime) {
          const txDiff = block.transactions.length;
          const timeDiff = block.timestamp - lastTime;
          const currentTps = timeDiff > 0 ? (txDiff / timeDiff).toFixed(2) : '0.00';
          setTps(currentTps);
        }

        // Convert gas price from wei to ETH
        const gasInEth = ethers.formatEther(fee.gasPrice || 0);
        setGas(parseFloat(gasInEth).toFixed(6));

        lastBlock = block;
        lastTime = block.timestamp;
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setTps('—');
        setGas('—');
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0f1115]/80 backdrop-blur-md text-white">
      <div className="glass max-w-5xl mx-auto p-10 rounded-2xl border border-cyan-500/20 shadow-xl space-y-10">
        <h2 className="text-3xl font-heading text-center text-cyan-300">
          Network Monitoring
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-[#0b0c10] p-6 rounded-xl border border-cyan-400/10 transition transform hover:scale-105 hover:shadow-md">
            <p className="text-sm text-gray-400 mb-1">TPS (Real-Time)</p>
            <p className="text-4xl font-bold text-cyan-200 tracking-wide">{tps}</p>
          </div>

          <div className="bg-[#0b0c10] p-6 rounded-xl border border-cyan-400/10 transition transform hover:scale-105 hover:shadow-md">
            <p className="text-sm text-gray-400 mb-1">Gas Price</p>
            <p className="text-4xl font-bold text-cyan-200 tracking-wide">{gas} ETH</p>
          </div>

          <div className="bg-[#0b0c10] p-6 rounded-xl border border-cyan-400/10 transition transform hover:scale-105 hover:shadow-md">
            <p className="text-sm text-gray-400 mb-1">Node Uptime</p>
            <p className="text-4xl font-bold text-cyan-200 tracking-wide">{uptime}%</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 pt-2">
          Stats refresh automatically every 4 seconds.
        </p>
      </div>
    </section>
  );
}
