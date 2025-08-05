'use client';

import { FiGithub, FiBookOpen, FiFileText } from 'react-icons/fi';

export default function CallToAction() {
  const actions = [
    {
      title: 'Docs',
      desc: 'Dive into Zelion’s architecture, CCIP, and privacy models.',
      href: '/docs',
      icon: <FiBookOpen className="text-cyan-400 text-2xl" />,
    },
    {
      title: 'GitHub',
      desc: 'Explore SDKs, smart contracts, and dev tools on GitHub.',
      href: 'https://github.com/zelion-network',
      icon: <FiGithub className="text-cyan-400 text-2xl" />,
    },
    {
      title: 'Blog',
      desc: 'Read updates, launch plans, and ecosystem stories.',
      href: 'https://medium.com/@zelionnetwork',
      icon: <FiFileText className="text-cyan-400 text-2xl" />,
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-12 bg-[#0f1115]/85 backdrop-blur-md text-white font-body">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* 🧠 Heading */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text drop-shadow">
            Explore Zelion Resources
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to build, integrate, or learn about post-quantum infrastructure.
          </p>
        </div>

        {/* 🔗 Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {actions.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group p-6 rounded-xl border border-cyan-400/10 shadow-xl hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-heading text-cyan-300 group-hover:text-white transition">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-gray-300 font-body leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
