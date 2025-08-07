import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Web3ReactProvider } from '@web3-react/core';
import StakingDashboard from '../../src/components/StakingDashboard';

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

// Mock the staking service
jest.mock('../../src/services/staking', () => ({
  getStakingService: jest.fn(() => ({
    getUserStakes: jest.fn().mockResolvedValue([
      {
        id: '1',
        amount: '1000',
        token: 'ZYL',
        startTime: Date.now() - 86400000, // 1 day ago
        endTime: Date.now() + 2592000000, // 30 days from now
        apy: '12.5',
        status: 'active'
      }
    ]),
    getStakingStats: jest.fn().mockResolvedValue({
      totalStaked: '5000000',
      averageAPY: '15.2',
      totalRewards: '25000'
    }),
    stakeTokens: jest.fn().mockResolvedValue({
      hash: '0x123456789',
      success: true
    }),
    unstakeTokens: jest.fn().mockResolvedValue({
      hash: '0x987654321',
      success: true
    }),
    claimRewards: jest.fn().mockResolvedValue({
      hash: '0xabcdef123',
      success: true
    })
  }))
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn()
  },
  writable: true
});

describe('StakingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders staking dashboard with tabs', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Check if the component renders
    expect(screen.getByText('Staking Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Flexible Staking')).toBeInTheDocument();
    expect(screen.getByText('Locked Staking')).toBeInTheDocument();
    expect(screen.getByText('My Stakes')).toBeInTheDocument();
  });

  test('displays staking statistics', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Check if statistics are displayed
    await waitFor(() => {
      expect(screen.getByText('Total Staked')).toBeInTheDocument();
      expect(screen.getByText('Average APY')).toBeInTheDocument();
      expect(screen.getByText('Total Rewards')).toBeInTheDocument();
    });
  });

  test('allows switching between staking tabs', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Click on Locked Staking tab
    const lockedTab = screen.getByText('Locked Staking');
    fireEvent.click(lockedTab);
    
    // Check if locked staking content is displayed
    expect(screen.getByText('Lock Period')).toBeInTheDocument();
    
    // Click back to Flexible Staking tab
    const flexibleTab = screen.getByText('Flexible Staking');
    fireEvent.click(flexibleTab);
    
    // Check if flexible staking content is displayed
    expect(screen.getByText('Flexible Staking')).toBeInTheDocument();
  });

  test('displays user stakes', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Click on My Stakes tab
    const myStakesTab = screen.getByText('My Stakes');
    fireEvent.click(myStakesTab);
    
    // Check if user stakes are displayed
    await waitFor(() => {
      expect(screen.getByText('1000 ZYL')).toBeInTheDocument();
      expect(screen.getByText('12.5% APY')).toBeInTheDocument();
    });
  });

  test('allows staking tokens', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Input staking amount
    const amountInput = screen.getByLabelText('Amount to stake');
    fireEvent.change(amountInput, { target: { value: '1000' } });
    
    // Click stake button
    const stakeButton = screen.getByText('Stake');
    fireEvent.click(stakeButton);
    
    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('Confirm Staking')).toBeInTheDocument();
    });
    
    // Confirm staking
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText('Staking Successful')).toBeInTheDocument();
    });
  });

  test('allows claiming rewards', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Click on My Stakes tab
    const myStakesTab = screen.getByText('My Stakes');
    fireEvent.click(myStakesTab);
    
    // Click claim rewards button
    const claimButton = screen.getByText('Claim Rewards');
    fireEvent.click(claimButton);
    
    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('Confirm Reward Claim')).toBeInTheDocument();
    });
    
    // Confirm claim
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText('Rewards Claimed')).toBeInTheDocument();
    });
  });

  test('handles staking errors gracefully', async () => {
    // Mock error scenario
    jest.mock('../../src/services/staking', () => ({
      getStakingService: jest.fn(() => ({
        getUserStakes: jest.fn().mockRejectedValue(new Error('Failed to fetch stakes')),
        getStakingStats: jest.fn().mockRejectedValue(new Error('Failed to fetch stats'))
      }))
    }));

    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load staking data/)).toBeInTheDocument();
    });
  });

  test('displays countdown for locked stakes', async () => {
    render(
      <MockWeb3ReactProvider>
        <StakingDashboard />
      </MockWeb3ReactProvider>
    );

    // Click on My Stakes tab
    const myStakesTab = screen.getByText('My Stakes');
    fireEvent.click(myStakesTab);
    
    // Check if countdown is displayed
    await waitFor(() => {
      expect(screen.getByText(/days remaining/)).toBeInTheDocument();
    });
  });
});
