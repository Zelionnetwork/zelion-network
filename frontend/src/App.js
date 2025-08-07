import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ErrorProvider } from './context/ErrorContext';
import ErrorConsole from './components/ErrorConsole';
import SwapInterface from './components/SwapInterface';
import StakingDashboard from './components/StakingDashboard';
import TransactionHistory from './components/TransactionHistory';
import PriceFeedDisplay from './components/PriceFeedDisplay';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function getLibrary(provider) {
  return new Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ErrorProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <ErrorConsole />
            
            <div className="container mx-auto px-4 py-8">
              <PriceFeedDisplay />
              
              <Routes>
                <Route path="/" element={<SwapInterface />} />
                <Route path="/swap" element={<SwapInterface />} />
                <Route path="/stake" element={<StakingDashboard />} />
                <Route path="/history" element={<TransactionHistory />} />
              </Routes>
            </div>
            
            <footer className="bg-gray-800 text-white py-6 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p>© 2023 Zelion Network. All rights reserved.</p>
                <div className="mt-2 flex justify-center space-x-4">
                  <a href="#" className="hover:text-indigo-300">Terms</a>
                  <a href="#" className="hover:text-indigo-300">Privacy</a>
                  <a href="#" className="hover:text-indigo-300">Docs</a>
                  <a href="#" className="hover:text-indigo-300">GitHub</a>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ErrorProvider>
    </Web3ReactProvider>
  );
}

export default App;
