import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Web3ReactProvider } from '@web3-react/core';
import SwapInterface from '../../src/components/SwapInterface';

// Mock the Web3 provider
const mockProvider = {
  request: jest.fn()
};

const MockWeb3ReactProvider = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={() => mockProvider}>
      {children}
    </Web3ReactProvider>
  );
};

// Mock the bridge service
jest.mock('../../src/services/bridge', () => ({
  getBridgeService: jest.fn(() => ({
    getSupportedTokens: jest.fn().mockResolvedValue([
      { symbol: 'ETH', name: 'Ethereum', balance: '10.0' },
      { symbol: 'ZYL', name: 'Zelion', balance: '1000.0' },
      { symbol: 'USDC', name: 'USD Coin', balance: '500.0' }
    ]),
    swapTokens: jest.fn().mockResolvedValue({
      hash: '0x123456789',
      success: true
    })
  }))
}));

// Mock the price feed service
jest.mock('../../src/services/priceFeed', () => ({
  getPriceFeedService: jest.fn(() => ({
    getPrice: jest.fn().mockResolvedValue(3200),
    getPriceRatio: jest.fn().mockResolvedValue(0.00015625),
    formatPrice: jest.fn().mockImplementation((price) => `$${price.toFixed(2)}`)
  }))
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn()
  },
  writable: true
});

describe('SwapInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders swap interface with token selection', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Check if the component renders
    expect(screen.getByText('Token Swap')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    
    // Wait for tokens to load
    await waitFor(() => {
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('ZYL')).toBeInTheDocument();
    });
  });

  test('allows token selection and amount input', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Wait for tokens to load
    await waitFor(() => {
      expect(screen.getByText('ETH')).toBeInTheDocument();
    });

    // Select tokens
    const fromTokenSelect = screen.getByLabelText('From Token');
    const toTokenSelect = screen.getByLabelText('To Token');
    
    fireEvent.change(fromTokenSelect, { target: { value: 'ETH' } });
    fireEvent.change(toTokenSelect, { target: { value: 'ZYL' } });
    
    // Input amount
    const amountInput = screen.getByLabelText('Amount');
    fireEvent.change(amountInput, { target: { value: '1.0' } });
    
    expect(amountInput.value).toBe('1.0');
  });

  test('calculates and displays price impact', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Wait for tokens to load
    await waitFor(() => {
      expect(screen.getByText('ETH')).toBeInTheDocument();
    });

    // Select tokens and input amount
    const fromTokenSelect = screen.getByLabelText('From Token');
    const toTokenSelect = screen.getByLabelText('To Token');
    const amountInput = screen.getByLabelText('Amount');
    
    fireEvent.change(fromTokenSelect, { target: { value: 'ETH' } });
    fireEvent.change(toTokenSelect, { target: { value: 'ZYL' } });
    fireEvent.change(amountInput, { target: { value: '1.0' } });
    
    // Check if price impact is displayed
    await waitFor(() => {
      expect(screen.getByText(/Price Impact/)).toBeInTheDocument();
    });
  });

  test('handles swap execution', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Wait for tokens to load
    await waitFor(() => {
      expect(screen.getByText('ETH')).toBeInTheDocument();
    });

    // Select tokens and input amount
    const fromTokenSelect = screen.getByLabelText('From Token');
    const toTokenSelect = screen.getByLabelText('To Token');
    const amountInput = screen.getByLabelText('Amount');
    
    fireEvent.change(fromTokenSelect, { target: { value: 'ETH' } });
    fireEvent.change(toTokenSelect, { target: { value: 'ZYL' } });
    fireEvent.change(amountInput, { target: { value: '1.0' } });
    
    // Click swap button
    const swapButton = screen.getByText('Swap');
    fireEvent.click(swapButton);
    
    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('Confirm Swap')).toBeInTheDocument();
    });
    
    // Confirm swap
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText('Swap Successful')).toBeInTheDocument();
    });
  });

  test('handles slippage tolerance settings', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Open settings
    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);
    
    // Change slippage tolerance
    const slippageInput = screen.getByLabelText('Slippage Tolerance');
    fireEvent.change(slippageInput, { target: { value: '1.0' } });
    
    expect(slippageInput.value).toBe('1.0');
  });

  test('displays user token balances', async () => {
    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Wait for tokens to load
    await waitFor(() => {
      expect(screen.getByText('ETH')).toBeInTheDocument();
    });

    // Check if balances are displayed
    await waitFor(() => {
      expect(screen.getByText('Balance: 10.0')).toBeInTheDocument();
    });
  });

  test('handles connection errors gracefully', async () => {
    // Mock error scenario
    jest.mock('../../src/services/bridge', () => ({
      getBridgeService: jest.fn(() => ({
        getSupportedTokens: jest.fn().mockRejectedValue(new Error('Connection failed'))
      }))
    }));

    render(
      <MockWeb3ReactProvider>
        <SwapInterface />
      </MockWeb3ReactProvider>
    );

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load tokens/)).toBeInTheDocument();
    });
  });
});
