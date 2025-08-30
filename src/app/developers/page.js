'use client';

import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FiTool, FiTerminal, FiShare2, FiGithub } from 'react-icons/fi';

export default function DevelopersPage() {
  const tools = [
    {
      title: 'Zelion SDK',
      desc: 'Lightweight JavaScript library to interact with ZYLToken, bridge contracts, and CCIP routers.',
      href: 'https://github.com/zelion-network/zylithium-sdk',
      icon: <FiShare2 className="text-cyan-300 text-3xl" />,
    },
    {
      title: 'Zylithium CLI',
      desc: 'Terminal toolkit to deploy, monitor, and control Solidity contracts across networks.',
      href: 'https://github.com/zelion-network/zylithium-cli',
      icon: <FiTerminal className="text-cyan-300 text-3xl" />,
    },
    {
      title: 'Cross-Chain Templates',
      desc: 'Prebuilt Solidity & Vyper contracts for token bridging, wallet checks, and emergency flows.',
      href: 'https://github.com/zelion-network/zylithium-contracts',
      icon: <FiTool className="text-cyan-300 text-3xl" />,
    },
  ];

  return (
    <>
      <main className="min-h-screen py-24 px-6 sm:px-12 bg-[#0f1115]/90 backdrop-blur-md text-white font-body">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* 🔹 Animated Page Heading */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text drop-shadow">
              Developer Toolkit
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Build scalable dApps, cross-chain bridges, and post-quantum protocols with Zelion.
              Access smart contract templates, CCIP modules, SDKs, and tools designed for global interoperability.
            </p>
          </motion.header>

          {/* 🧰 Toolkit Cards */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {tools.map((tool, idx) => (
              <a
                key={idx}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group p-6 rounded-xl border border-cyan-500/10 hover:border-cyan-400/30 shadow-lg hover:scale-[1.03] hover:bg-cyan-400/5 transition-all text-left"
              >
                <div className="mb-4">{tool.icon}</div>
                <h3 className="text-xl font-heading text-cyan-300 group-hover:text-white transition">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-300 mt-2">{tool.desc}</p>
              </a>
            ))}
          </motion.section>

          {/* 🚀 CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <a
              href="https://github.com/zelion-network"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-zelion inline-flex items-center gap-2 px-6 py-3 font-semibold"
            >
              <FiGithub className="text-lg" />
              Explore Developer Repos
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
