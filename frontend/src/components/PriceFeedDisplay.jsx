import React, { useState, useEffect } from 'react';
import { getPriceFeedService } from '../services/priceFeed';

const PriceFeedDisplay = ({ provider }) => {
  const [prices, setPrices] = useState({
    ETH: 0,
    ZYL: 0,
    USDC: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const priceService = getPriceFeedService(provider);
        
        // Initialize if needed
        await priceService.initialize();
        
        // Get all prices
        const latestPrices = await priceService.getAllPrices();
        setPrices(latestPrices);
        
        // Set up periodic updates
        const interval = setInterval(async () => {
          try {
            priceService.updateMockPrices();
            const updatedPrices = await priceService.getAllPrices();
            setPrices(updatedPrices);
          } catch (err) {
            console.error('Error updating prices:', err);
          }
        }, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch prices:', err);
      } finally {
        setLoading(false);
      }
    };

    if (provider) {
      fetchPrices();
    }
  }, [provider]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Real-time Prices</h3>
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Real-time Prices</h3>
        <div className="text-red-500 text-center py-4">
          Error loading prices: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Real-time Prices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500 mb-1">ETH/USD</div>
          <div className="text-xl font-bold text-gray-800">{formatPrice(prices.ETH)}</div>
          <div className="text-xs text-gray-400 mt-1">Chainlink Oracle</div>
        </div>
        
        <div className="border rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500 mb-1">ZYL/USD</div>
          <div className="text-xl font-bold text-gray-800">{formatPrice(prices.ZYL)}</div>
          <div className="text-xs text-gray-400 mt-1">Chainlink Oracle</div>
        </div>
        
        <div className="border rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500 mb-1">USDC/USD</div>
          <div className="text-xl font-bold text-gray-800">{formatPrice(prices.USDC)}</div>
          <div className="text-xs text-gray-400 mt-1">Chainlink Oracle</div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Prices update every 30 seconds
      </div>
    </div>
  );
};

export default PriceFeedDisplay;
