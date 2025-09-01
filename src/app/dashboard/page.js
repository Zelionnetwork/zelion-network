'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  TrendingUp, 
  Shuffle, 
  Droplets, 
  Activity,
  Settings,
  BarChart3,
  ArrowRight,
  Wallet2,
  Home,
  Shield,
  Wifi,
  Zap,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { ethers } from 'ethers';

import DashboardPanel from '../components/DashboardPanel';
import MonitoringPanel from '../components/MonitoringPanel';
import BridgePanel from '../components/BridgePanel';
import EmergencyPanel from '../components/EmergencyPanel';
import PrivacyControls from '../components/PrivacyControls';
import SwapPanel from '../components/SwapPanel';
import Faucet from '../components/Faucet';
import Staking from '../components/Staking';

const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc'); // Arbitrum Sepolia

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    tps: '-',
    gas: '-',
    uptime: '99.9999',
    blockNumber: '-',
    lastUpdate: new Date()
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/connect');
    }
  }, [isConnected, router]);

  // Network monitoring effect
  useEffect(() => {
    let lastBlock = null;
    let lastTime = null;

    const fetchNetworkMetrics = async () => {
      try {
        const block = await provider.getBlock('latest');
        const fee = await provider.getFeeData();

        if (lastBlock && lastTime) {
          const txDiff = block.transactions.length;
          const timeDiff = block.timestamp - lastTime;
          const currentTps = timeDiff > 0 ? (txDiff / timeDiff).toFixed(2) : '0.00';
          
          setNetworkStats(prev => ({
            ...prev,
            tps: currentTps,
            gas: parseFloat(ethers.formatEther(fee.gasPrice || 0)).toFixed(6),
            blockNumber: block.number.toString(),
            lastUpdate: new Date()
          }));
        } else {
          setNetworkStats(prev => ({
            ...prev,
            gas: parseFloat(ethers.formatEther(fee.gasPrice || 0)).toFixed(6),
            blockNumber: block.number.toString(),
            lastUpdate: new Date()
          }));
        }

        lastBlock = block;
        lastTime = block.timestamp;
      } catch (err) {
        console.error('Error fetching network metrics:', err);
        setNetworkStats(prev => ({
          ...prev,
          tps: '—',
          gas: '—',
          lastUpdate: new Date()
        }));
      }
    };

    fetchNetworkMetrics();
    const interval = setInterval(fetchNetworkMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isConnected) return null;

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-5 h-5" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 'bridge',
      label: 'Bridge',
      icon: <Shuffle className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'swap',
      label: 'Swap',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'faucet',
      label: 'Faucet',
      icon: <Droplets className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'staking',
      label: 'Staking',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-red-500 to-pink-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Network Monitoring Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="text-gray-400 text-xs sm:text-sm">TPS (Real-Time)</span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-cyan-200">{networkStats.tps}</p>
                <p className="text-xs text-gray-500 mt-1">Transactions per second</p>
              </div>

              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="text-gray-400 text-xs sm:text-sm">Gas Price</span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-200">{networkStats.gas} ETH</p>
                <p className="text-xs text-gray-500 mt-1">Current gas price</p>
              </div>

              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="text-gray-400 text-xs sm:text-sm">Node Uptime</span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-200">{networkStats.uptime}%</p>
                <p className="text-xs text-gray-500 mt-1">Network availability</p>
              </div>

              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    <span className="text-gray-400 text-xs sm:text-sm">Block Number</span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-orange-200">{networkStats.blockNumber}</p>
                <p className="text-xs text-gray-500 mt-1">Latest block</p>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {sidebarItems.slice(1, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full p-3 rounded-lg border border-cyan-500/20 hover:border-cyan-300/40 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <span className="text-sm sm:text-base text-white group-hover:text-cyan-200 transition-colors">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-4">Wallet Info</h3>
                <DashboardPanel />
              </div>
            </motion.div>

            {/* Last Update Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-xs sm:text-sm text-gray-500">
                Network stats refresh automatically every 4 seconds • Last update: {networkStats.lastUpdate.toLocaleTimeString()}
              </p>
            </motion.div>
          </div>
        );

      case 'bridge':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BridgePanel />
          </motion.div>
        );

      case 'swap':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SwapPanel />
          </motion.div>
        );

      case 'faucet':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Faucet />
          </motion.div>
        );

      case 'staking':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Staking />
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MonitoringPanel />
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-4">Emergency Controls</h3>
              <EmergencyPanel />
            </div>
            <div className="bg-[#0b0c10]/80 rounded-xl border border-cyan-500/20 p-4 sm:p-6 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-4">Privacy Controls</h3>
              <PrivacyControls />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-body flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative lg:translate-x-0 z-50 lg:z-auto w-64 bg-[#0b0c10]/90 border-r border-cyan-500/20 backdrop-blur-sm transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0 h-full' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <img
                src="/assets/zelionlogo.jpg"
                alt="Zelion Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded-full"
              />
              <span className="text-base sm:text-lg font-heading font-bold text-transparent bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text">
                Zelion
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false); // Close sidebar on mobile when navigating
                }}
                className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-200'
                    : 'text-gray-300 hover:text-white hover:bg-[#0a0b0f]/50'
                }`}
              >
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  activeTab === item.id
                    ? 'bg-gradient-to-br ' + item.color
                    : 'bg-gray-600 group-hover:bg-gradient-to-br group-hover:' + item.color
                } transition-all duration-300`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-cyan-500/20 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                  {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-400 mt-1 text-sm">
                  {activeTab === 'overview' 
                    ? 'Monitor network performance and manage your DeFi activities'
                    : `Access ${sidebarItems.find(item => item.id === activeTab)?.label.toLowerCase()} functionality`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 text-cyan-300">
                <Wallet2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
