'use client';

import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import {
  FaXTwitter,
  FaTelegram,
  FaGlobe,
  FaDiscord,
  FaGithub,
  FaMedium,
  FaLinkedin,
  FaWhatsapp,
  FaTiktok,
  FaInstagram,
} from 'react-icons/fa6';

export default function AboutPage() {
  const socials = [
    {
      label: 'X (Twitter)',
      icon: <FaXTwitter size={20} />,
      href: 'https://x.com/zelion_network',
    },
    {
      label: 'Discord',
      icon: <FaDiscord size={20} />,
      href: 'https://discord.gg/EwRE2HeH5Y',
    },
    {
      label: 'Telegram',
      icon: <FaTelegram size={20} />,
      href: 'https://t.me/zelion_network',
    },
    {
      label: 'LinkedIn',
      icon: <FaLinkedin size={20} />,
      href: 'https://www.linkedin.com/company/zelion-network',
    },
    {
      label: 'WhatsApp',
      icon: <FaWhatsapp size={20} />,
      href: 'https://www.whatsapp.com/channel/0029VbAlHsU0wajnssrJY80c',
    },
    {
      label: 'TikTok',
      icon: <FaTiktok size={20} />,
      href: 'https://tiktok.com/@zelion_network',
    },
    {
      label: 'Instagram',
      icon: <FaInstagram size={20} />,
      href: 'https://instagram.com/zelion_network',
    },
    {
      label: 'GitHub',
      icon: <FaGithub size={20} />,
      href: 'https://github.com/zelion-network',
    },
    {
      label: 'Medium',
      icon: <FaMedium size={20} />,
      href: 'https://medium.com/@zelionnetwork',
    },
    {
      label: 'Website',
      icon: <FaGlobe size={20} />,
      href: 'https://zelion.network',
    },
  ];

  return (
    <>
      <main className="min-h-screen py-24 px-6 sm:px-12 bg-[#0f1115]/90 backdrop-blur-md text-white font-body">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* 🧠 Page Heading */}
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text drop-shadow">
              About Zelion
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Zelion is a post-quantum blockchain infrastructure designed for developers, enterprises,
              and visionary ecosystems. We build with privacy, speed, and zero-friction interoperability at our core.
            </p>
          </motion.header>

          {/* 🌐 Core Values */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Built for the Future',
                desc: 'Quantum-resilient encryption and zk-native privacy by design.',
              },
              {
                title: 'Truly Cross-Chain',
                desc: 'One unified bridge for EVM, non-EVM, and future-proof standards.',
              },
              {
                title: 'Dev-Centric Core',
                desc: 'Built for scale, open for builders, governed by innovation.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-xl border border-cyan-500/10 shadow-lg hover:scale-[1.03] hover:bg-cyan-400/5 transition-all text-left"
              >
                <h3 className="text-xl font-heading text-cyan-300 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </motion.section>

          {/* 🔗 Social Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl font-heading text-cyan-300">
              Connect with Us
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-white transition duration-200 border border-cyan-500/10 px-4 py-2 rounded-full glass backdrop-blur-md shadow hover:scale-105"
                >
                  {icon}
                  <span className="text-sm font-medium">{label}</span>
                </a>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </>
  );
}
