import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Web3ReactProvider } from '@web3-react/core';
import TransactionHistory from '../../src/components/TransactionHistory';

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

// Mock the transaction service
jest.mock('../../src/services/transaction', () => ({
  getTransactionService: jest.fn(() => ({
    getTransactionHistory: jest.fn().mockResolvedValue([
      {
        id: '1',
        type: 'swap',
        fromToken: 'ETH',
        toToken: 'ZYL',
        amount: '1.0',
        timestamp: new Date().toISOString(),
        status: 'completed',
        hash: '0x123456789'
      },
      {
        id: '2',
        type: 'stake',
        token: 'ZYL',
        amount: '1000',
        duration: '30 days',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        hash: '0x987654321'
      },
      {
        id: '3',
        type: 'bridge',
        fromChain: 'Ethereum',
        toChain: 'Polygon',
        token: 'ZYL',
        amount: '500',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        hash: '0xabcdef123'
      }
    ])
  }))
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn()
  },
  writable: true
});

describe('TransactionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders transaction history with tabs', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if the component renders
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('All Transactions')).toBeInTheDocument();
    expect(screen.getByText('Swaps')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
    expect(screen.getByText('Bridge')).toBeInTheDocument();
  });

  test('displays transaction history', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if transactions are displayed
    await waitFor(() => {
      expect(screen.getByText('ETH → ZYL')).toBeInTheDocument();
      expect(screen.getByText('1000 ZYL')).toBeInTheDocument();
      expect(screen.getByText('500 ZYL')).toBeInTheDocument();
    });
  });

  test('allows filtering by transaction type', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Click on Swaps tab
    const swapsTab = screen.getByText('Swaps');
    swapsTab.click();
    
    // Check if only swap transactions are displayed
    await waitFor(() => {
      expect(screen.getByText('ETH → ZYL')).toBeInTheDocument();
      expect(screen.queryByText('1000 ZYL')).not.toBeInTheDocument();
    });
    
    // Click on Staking tab
    const stakingTab = screen.getByText('Staking');
    stakingTab.click();
    
    // Check if only staking transactions are displayed
    await waitFor(() => {
      expect(screen.getByText('1000 ZYL')).toBeInTheDocument();
      expect(screen.queryByText('ETH → ZYL')).not.toBeInTheDocument();
    });
  });

  test('displays transaction status correctly', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if transaction statuses are displayed
    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('displays transaction timestamps', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if timestamps are displayed
    await waitFor(() => {
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  test('handles empty transaction history', async () => {
    // Mock empty transaction history
    jest.mock('../../src/services/transaction', () => ({
      getTransactionService: jest.fn(() => ({
        getTransactionHistory: jest.fn().mockResolvedValue([])
      }))
    }));

    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if empty state is displayed
    await waitFor(() => {
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
    });
  });

  test('handles transaction loading errors', async () => {
    // Mock error scenario
    jest.mock('../../src/services/transaction', () => ({
      getTransactionService: jest.fn(() => ({
        getTransactionHistory: jest.fn().mockRejectedValue(new Error('Failed to fetch transactions'))
      }))
    }));

    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load transaction history/)).toBeInTheDocument();
    });
  });

  test('allows viewing transaction details', async () => {
    render(
      <MockWeb3ReactProvider>
        <TransactionHistory />
      </MockWeb3ReactProvider>
    );

    // Click on a transaction to view details
    await waitFor(() => {
      const transactionRow = screen.getByText('ETH → ZYL').closest('tr');
      transactionRow.click();
    });
    
    // Check if transaction details are displayed
    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText('0x123456789')).toBeInTheDocument();
    });
  });
});
