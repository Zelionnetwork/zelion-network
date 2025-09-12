# Zelion Network Frontend

A modern DeFi frontend for the Zelion Network, built with Next.js and integrated with smart contracts on Arbitrum Sepolia testnet.

## Features

- **Token Faucet**: Request ZYL tokens for testing (100 ZYL per request, 24-hour cooldown)
- **Staking System**: Stake ZYL tokens to earn rewards with 20% APY
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets via RainbowKit
- **Real-time Updates**: Live balance and staking data updates

## Smart Contract Addresses (Arbitrum Sepolia)

- **ZYL Token**: `0xB3F18c487c020A0EfD0dae6F1EDDbE24fcc757D0`
- **Faucet Contract**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Staking Contract**: `0xC5E05EBA99784b00Dd0244c0E47A4DAe79F2eF72`

## Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask or compatible Web3 wallet
- Arbitrum Sepolia testnet configured in wallet

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your Web3 wallet
2. **Get Test Tokens**: Visit the Faucet page to request 100 ZYL tokens
3. **Stake Tokens**: Go to Staking page, enter amount, approve tokens, then stake
4. **Earn Rewards**: Rewards accrue at 20% APY and can be claimed anytime
5. **Unstake**: Withdraw your staked tokens instantly

## Technical Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Web3**: Wagmi, Viem, RainbowKit
- **Blockchain**: Arbitrum Sepolia testnet
- **Smart Contracts**: Solidity, OpenZeppelin

## Recent Updates

- Fixed faucet token address and button text
- Corrected staking contract function names
- Added automatic balance refreshing after transactions
- Implemented proper error handling and loading states

## Development

The project structure:
- `/src/app/components/` - React components (Faucet, Staking, etc.)
- `/src/app/hooks/` - Custom React hooks for blockchain interactions
- `/src/contracts/` - Contract addresses and ABIs
