'use client';

import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import {
  FiLink,
  FiShield,
  FiCpu,
  FiActivity,
  FiBookOpen,
  FiGithub,
  FiExternalLink,
} from 'react-icons/fi';

export default function EcosystemPage() {
  const categories = [
    {
      title: 'Bridges & Interop',
      icon: <FiLink className="text-cyan-300 text-2xl mb-2" />,
      items: [
        { label: 'Chainlink CCIP', href: 'https://chain.link/cross-chain' },
        { label: 'LayerZero', href: 'https://layerzero.network' },
        { label: 'Axelar', href: 'https://axelar.network' },
        { label: 'Wormhole', href: 'https://wormhole.com' },
      ],
    },
    {
      title: 'Wallets & Access',
      icon: <FiShield className="text-cyan-300 text-2xl mb-2" />,
      items: [
        { label: 'MetaMask', href: 'https://metamask.io' },
        { label: 'WalletConnect', href: 'https://walletconnect.com' },
        { label: 'Coinbase Wallet', href: 'https://www.coinbase.com/wallet' },
        { label: 'Safe (Gnosis)', href: 'https://safe.global' },
      ],
    },
    {
      title: 'Dev Tools',
      icon: <FiCpu className="text-cyan-300 text-2xl mb-2" />,
      items: [
        { label: 'Hardhat', href: 'https://hardhat.org' },
        { label: 'Foundry', href: 'https://book.getfoundry.sh' },
        { label: 'Ethers.js', href: 'https://docs.ethers.org' },
        { label: 'ZkStack', href: 'https://zksync.io/zkstack.html' },
        { label: 'OpenZeppelin', href: 'https://openzeppelin.com' },
      ],
    },
    {
      title: 'Partners & Infra',
      icon: <FiActivity className="text-cyan-300 text-2xl mb-2" />,
      items: [
        { label: 'The Graph', href: 'https://thegraph.com' },
        { label: 'Zelion', href: 'https://zelion.network' },
        { label: 'QuickNode', href: 'https://www.quicknode.com' },
        { label: 'Infura', href: 'https://www.infura.io' },
      ],
    },
    {
      title: 'Standards & Protocols',
      icon: <FiBookOpen className="text-cyan-300 text-2xl mb-2" />,
      items: [
        { label: 'ERC-20', href: 'https://eips.ethereum.org/EIPS/eip-20' },
        { label: 'ERC-4337', href: 'https://eips.ethereum.org/EIPS/eip-4337' },
        { label: 'ZK-SNARKs', href: 'https://z.cash/technology/zksnarks' },
        { label: 'EIP-4844', href: 'https://eips.ethereum.org/EIPS/eip-4844' },
      ],
    },
  ];

  return (
    <>
      <section className="min-h-screen py-24 px-6 sm:px-12 bg-[#0f1115]/90 backdrop-blur-md text-white font-body">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* 🔹 Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-200 bg-clip-text drop-shadow">
              Zelion Ecosystem
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A growing ecosystem of bridges, wallets, dev tools, and decentralized protocols built around Zelion's
              post-quantum infrastructure.
            </p>
          </motion.header>

          {/* 🌐 Ecosystem Grid */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-xl border border-cyan-500/10 hover:border-cyan-300/30 shadow-lg hover:scale-[1.03] hover:bg-cyan-400/5 transition-all text-left"
              >
                {cat.icon}
                <h3 className="text-xl font-heading text-cyan-300 mb-3">{cat.title}</h3>
                <ul className="space-y-2 text-sm text-gray-300 font-body pl-1">
                  {cat.items.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-cyan-200 transition"
                      >
                        <FiExternalLink className="text-xs" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.section>

          {/* 🚀 Call to Action */}
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
              Contribute to Ecosystem
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
