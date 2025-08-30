'use client';

import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import {
  FiCode,
  FiBook,
  FiTerminal,
  FiGithub,
  FiExternalLink,
} from 'react-icons/fi';

export default function DocsPage() {
  const docs = [
    {
      title: 'Smart Contract Kit',
      desc: 'Access Solidity SDKs, Hardhat configs, and chain deployment tools.',
      href: 'https://github.com/zelion-network/zylithium-chain',
      icon: <FiCode className="text-2xl text-cyan-300" />,
    },
    {
      title: 'Zelion Dev Docs',
      desc: 'Understand ZYLToken, cross-chain transfer, and zk modules.',
      href: 'https://github.com/zelion-network/zylithium-docs',
      icon: <FiBook className="text-2xl text-cyan-300" />,
    },
    {
      title: 'Zelion CLI Tools',
      desc: 'Automate deployments, bridge transactions, and manage wallets.',
      href: 'https://github.com/zelion-network/zylithium-cli',
      icon: <FiTerminal className="text-2xl text-cyan-300" />,
    },
    {
      title: 'Zelion Whitepaper',
      desc: 'Explore the full whitepaper outlining the vision, tokenomics, and roadmap.',
      href: 'https://eu.docworkspace.com/d/sIBmxj6aLAvfWjsQG',
      icon: <FiExternalLink className="text-2xl text-cyan-300" />,
    },
  ];

  return (
    <>
      <section className="min-h-screen py-24 px-6 sm:px-12 bg-[#0f1115]/85 backdrop-blur-md text-white">
        <div className="max-w-6xl mx-auto space-y-16 text-center">
          {/* 🧠 Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-200 bg-clip-text drop-shadow-xl">
              Documentation Portal
            </h1>
            <p className="text-gray-300 text-lg font-body max-w-3xl mx-auto leading-relaxed">
              Explore our developer documentation, API references, SDKs, and architecture insights.
              Whether you're building on Zelion or integrating with your chain — it's all here.
            </p>
          </motion.div>

          {/* 📚 Docs Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {docs.map((doc, idx) => (
              <a
                key={idx}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group p-6 rounded-xl border border-cyan-500/10 shadow-lg hover:scale-[1.03] hover:border-cyan-300/30 hover:bg-cyan-500/5 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  {doc.icon}
                  <h3 className="text-xl font-heading text-cyan-300 group-hover:text-white transition">
                    {doc.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-300 font-body">{doc.desc}</p>
              </a>
            ))}
          </motion.div>

          {/* 🚀 CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <a
              href="https://github.com/zelion-network"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zelion inline-flex items-center gap-2 px-6 py-3 font-semibold"
            >
              <FiGithub className="text-lg" />
              View Full GitHub
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
