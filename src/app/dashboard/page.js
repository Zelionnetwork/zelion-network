'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

import Navbar from '../components/Navbar'; // ✅ Add navbar
import DashboardPanel from '../components/DashboardPanel';
import MonitoringPanel from '../components/MonitoringPanel';
import BridgePanel from '../components/BridgePanel';
import EmergencyPanel from '../components/EmergencyPanel';
import PrivacyControls from '../components/PrivacyControls';

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/connect');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <>
      <Navbar />
      <main className="pt-24">
        <DashboardPanel />
        <MonitoringPanel />
        <BridgePanel />
        <EmergencyPanel />
        <PrivacyControls />
      </main>
    </>
  );
}
