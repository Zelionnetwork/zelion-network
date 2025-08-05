'use client';

export default function Footer() {
  return (
    <footer className="relative py-10 text-center bg-[#0f1115]/80 backdrop-blur-md border-t border-cyan-500/10 overflow-hidden">

      {/* 💠 Subtle neon glow ring */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      {/* 🌐 Text */}
      <p className="text-sm text-gray-400 font-body tracking-wide z-10 relative">
        © {new Date().getFullYear()} <span className="text-cyan-400 font-semibold">Zelion Network</span>. All rights reserved.
      </p>

      {/* ✨ Floating orb blur */}
      <div className="absolute -bottom-16 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
    </footer>
  );
}
