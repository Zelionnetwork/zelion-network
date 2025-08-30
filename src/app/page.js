'use client';

import Features from './components/Features';
import CallToAction from './components/CallToAction';
import StatsSection from './components/StatsSection';
import ChainsSupported from './components/ChainsSupported';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <>
      <Features />
      <CallToAction />
      <StatsSection />
      <ChainsSupported />
      <Footer />
    </>
  );
}
