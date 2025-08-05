'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/#hero' },
    { label: 'Features', href: '/#features' },
    { label: 'Connect', href: '/connect' },
    { label: 'About', href: '/about' },
    { label: 'Docs', href: '/docs' },
    { label: 'Developers', href: '/developers' },
    { label: 'Ecosystem', href: '/ecosystem' },
  ];

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/40 backdrop-blur-md border-b border-cyan-500/10 shadow-md">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 sm:px-10 py-4">
        {/* 🔷 Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/assets/zelionlogo.jpg"
            alt="Zelion Logo"
            className="w-10 h-10 object-contain rounded-full hover:brightness-125 transition duration-300 shadow-lg"
          />
          <span className="text-xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text">
            Zelion
          </span>
        </div>

        {/* 📱 Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-cyan-300 focus:outline-none z-50"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* 🔗 Desktop Nav */}
        <ul className="hidden sm:flex gap-8 text-sm font-medium font-body text-gray-300">
          {navItems.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="hover:text-cyan-300 transition duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔗 Animated Mobile Menu */}
      <div
        className={`sm:hidden bg-[#0f1115] transition-all duration-500 overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-4 px-6 py-4 text-sm font-body text-gray-300">
          {navItems.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                onClick={() => setIsOpen(false)}
                className="block py-2 px-2 rounded hover:text-cyan-300 transition duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
