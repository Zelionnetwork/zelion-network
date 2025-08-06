'use client';

import { 
  FaFacebook, 
  FaXTwitter, 
  FaDiscord, 
  FaTelegram, 
  FaLinkedin, 
  FaWhatsapp, 
  FaTiktok, 
  FaInstagram, 
  FaGithub 
} from 'react-icons/fa6';

export default function Footer() {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://www.facebook.com/profile.php?id=61578924611618',
      color: 'hover:text-blue-600'
    },
    {
      name: 'X (Twitter)',
      icon: FaXTwitter,
      url: 'https://x.com/zelion_network',
      color: 'hover:text-gray-400'
    },
    {
      name: 'Discord',  
      icon: FaDiscord,
      url: 'https://discord.gg/EwRE2HeH5Y',
      color: 'hover:text-indigo-500'
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: 'https://t.me/zelion_network',
      color: 'hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://www.linkedin.com/company/zelion-network',
      color: 'hover:text-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: 'https://www.whatsapp.com/channel/0029VbAlHsU0wajnssrJY80c',
      color: 'hover:text-green-500'
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://tiktok.com/@zelion_network',
      color: 'hover:text-pink-500'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com/zelion_network',
      color: 'hover:text-pink-400'
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      url: 'https://github.com/Zelionnetwork',
      color: 'hover:text-gray-300'
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                Zelion Network
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                Building the future of cross-chain interoperability. Connect, bridge, and explore the decentralized ecosystem with confidence.
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center transition-all duration-300 ${social.color} hover:bg-gray-700 hover:scale-110`}
                      title={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/docs" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/developers" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Developers
                </a>
              </li>
              <li>
                <a href="/ecosystem" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Ecosystem
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Zelion Network. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
