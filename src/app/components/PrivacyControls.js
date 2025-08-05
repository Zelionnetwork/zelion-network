'use client';

import { useState } from 'react';

export default function PrivacyControls() {
  const [zkEnabled, setZkEnabled] = useState(true);
  const [complianceMode, setComplianceMode] = useState(false);

  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0f1115]/80 backdrop-blur-md text-white">
      <h2 className="text-3xl font-heading text-cyan-300 text-center mb-10">
        Privacy Controls
      </h2>

      <div className="glass max-w-2xl mx-auto p-8 rounded-xl shadow-xl border border-cyan-500/20 space-y-6">
        <p className="text-gray-400 text-sm">
          Fine-tune your privacy and compliance settings. ZK mode ensures on-chain anonymity, while Compliance Mode allows optional verification for KYC or audits.
        </p>

        {/* ZK Mode Toggle */}
        <div className="flex items-center justify-between bg-[#0b0c10] p-4 rounded-lg border border-cyan-500/10">
          <span className="text-white font-medium">Zero-Knowledge Mode</span>
          <button
            onClick={() => setZkEnabled(!zkEnabled)}
            className={`w-12 h-6 flex items-center rounded-full transition-all duration-300 ${zkEnabled ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${zkEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Compliance Toggle */}
        <div className="flex items-center justify-between bg-[#0b0c10] p-4 rounded-lg border border-cyan-500/10">
          <span className="text-white font-medium">Compliance Mode</span>
          <button
            onClick={() => setComplianceMode(!complianceMode)}
            className={`w-12 h-6 flex items-center rounded-full transition-all duration-300 ${complianceMode ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${complianceMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
