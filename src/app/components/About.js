'use client';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 sm:px-12 bg-[#0f1115]/80 backdrop-blur-md text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <h3 className="text-4xl sm:text-5xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text drop-shadow">
          About Zelion
        </h3>

        <p className="text-gray-300 text-lg sm:text-xl font-body leading-relaxed">
          <span className="text-cyan-300 font-semibold">Zelion</span> is a next-generation blockchain platform architected for the post-quantum era.
          We deliver trustless privacy, zero-friction cross-chain execution, and unmatched scalability — all powered by zk and post-quantum cryptography.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: 'Mission',
              desc: 'To empower developers and users with tools that redefine blockchain security and interoperability.',
            },
            {
              title: 'Vision',
              desc: 'A trustless, borderless network where performance meets unbreakable privacy.',
            },
            {
              title: 'Core Values',
              desc: 'Security. Sovereignty. Speed. Innovation. We build for tomorrow.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass p-6 rounded-xl border border-cyan-500/10 shadow-lg transition hover:scale-[1.03]"
            >
              <h4 className="text-xl text-cyan-300 font-semibold font-heading mb-2">{item.title}</h4>
              <p className="text-sm text-gray-300 font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
