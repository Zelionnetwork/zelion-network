# Zelion Network User Guide

## Welcome to Zelion Network 🚀

Zelion Network is a quantum-secure blockchain platform built for the future. This guide will help you get started with our testnet dApp.

**Live Application:** [https://zelion-bridge.windsurf.build/](https://zelion-bridge.windsurf.build/)

## Table of Contents
- [Getting Started](#getting-started)
- [Connecting Your Wallet](#connecting-your-wallet)
- [Core Features](#core-features)
  - [Faucet](#faucet)
  - [Staking](#staking)
  - [Swap](#swap)
  - [Bridge](#bridge)
- [Supported Networks](#supported-networks)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
1. **MetaMask Wallet** - Install from [metamask.io](https://metamask.io)
2. **Test ETH** - Get Arbitrum Sepolia ETH from [Arbitrum Faucet](https://faucet.arbitrum.io)

### Quick Start
1. Visit [Zelion Network](https://zelion-bridge.windsurf.build/)
2. Connect your wallet using the "Connect Wallet" button
3. Switch to Arbitrum Sepolia network when prompted
4. Get ZYL tokens from the faucet

## Connecting Your Wallet

### Step 1: Click "Connect Wallet"
Navigate to any page with DeFi features and click the "Connect Wallet" button.

### Step 2: Choose Your Wallet
Select MetaMask or your preferred wallet from the connection modal.

### Step 3: Approve Connection
Approve the connection request in your wallet.

### Step 4: Switch Network
If prompted, switch to Arbitrum Sepolia testnet.

## Core Features

### Faucet
Get free ZYL tokens for testing (testnet only).

**How to use:**
1. Navigate to the Faucet page at [https://zelion-bridge.windsurf.build/faucet](https://zelion-bridge.windsurf.build/faucet)
2. Connect your wallet to Arbitrum Sepolia network
3. View your current ZYL token balance (displayed automatically)
4. Click "Request 100 ZYL Tokens"
5. Confirm the transaction in MetaMask
6. Wait for transaction confirmation
7. Your balance will update automatically

**Features:**
- **Balance Display**: See your current ZYL token balance in real-time
- **24-Hour Cooldown**: Enforced by smart contract, persists across sessions
- **Cooldown Timer**: Shows remaining time until next claim (after first use)
- 100 ZYL tokens per request
- Maximum 10 requests per address (lifetime)

**Cooldown System:**
- After claiming, you must wait 24 hours before claiming again
- The countdown timer appears automatically after your first claim
- Cooldown is stored on the blockchain, so it persists even if you close your browser
- Timer shows hours:minutes:seconds remaining

### Staking
Earn rewards by staking your ZYL tokens.

**How to stake:**
1. Go to the Staking page at [https://zelion-bridge.windsurf.build/staking](https://zelion-bridge.windsurf.build/staking)
2. View your current staked balance and pending rewards (displayed automatically)
3. Enter the amount you want to stake
4. Click "Approve ZYL" (first time only)
5. Click "Stake ZYL"
6. Confirm the transaction in MetaMask
7. Your staked balance updates in real-time

**Features:**
- **Real-time Balance Display**: See your staked amount and available ZYL balance
- **Pending Rewards Tracking**: View accumulated rewards before claiming
- **Instant Updates**: Balance refreshes automatically after transactions
- **No Lock-up Period**: Unstake anytime without penalties

**Staking Details:**
- Minimum stake: 100 ZYL
- Maximum stake: 1,000,000 ZYL
- Reward rate: 10% APY (0.1 ZYL per second base rate)
- Rewards calculated continuously

**How to unstake:**
1. Enter the amount to unstake in the "Unstake" section
2. Click "Unstake ZYL"
3. Confirm the transaction
4. Tokens return to your wallet instantly
5. Balance updates automatically

**Claiming Rewards:**
- Click "Claim Rewards" to collect earned ZYL
- Rewards accumulate every second you have tokens staked
- No minimum claim amount

### Swap
Exchange tokens using our decentralized exchange.

**How to swap:**
1. Navigate to the Swap page at [https://zelion-bridge.windsurf.build/swap](https://zelion-bridge.windsurf.build/swap)
2. View your token balances (displayed automatically)
3. Select tokens to swap from the dropdown menus
4. Enter the amount you want to swap
5. Review the exchange rate and estimated output
6. Click "Approve" for the input token (first time only)
7. Click "Swap Tokens"
8. Confirm the transaction in MetaMask
9. Balances update automatically after confirmation

**Features:**
- **Real-time Balance Display**: See your current token balances
- **Live Price Updates**: Exchange rates update automatically
- **Slippage Protection**: Built-in protection against price changes
- **Multi-token Support**: Swap between ZYL, USDC, USDT, DAI, and WETH
- 0.3% swap fee
- Instant settlement

### Bridge
Transfer tokens between different blockchains.

**How to bridge:**
1. Go to the Bridge page at [https://zelion-bridge.windsurf.build/bridge](https://zelion-bridge.windsurf.build/bridge)
2. Connect your wallet to the source network
3. Select source and destination chains from the dropdowns
4. Enter the amount of ZYL tokens to bridge
5. Review the bridge fee (0.001 ETH)
6. Click "Approve ZYL" (first time only)
7. Click "Bridge Tokens"
8. Confirm the transaction in MetaMask
9. Wait for cross-chain confirmation
10. Switch to destination network to see your tokens

**Supported Routes:**
- **Arbitrum Sepolia** ↔ **Polygon Amoy**
- Bi-directional bridging supported

**Bridge Details:**
- **Bridge Fee**: 0.001 ETH (paid on source chain)
- **Typical Time**: 10-15 minutes
- **Maximum Time**: 30 minutes
- **Minimum Amount**: No minimum
- **Technology**: Chainlink CCIP for secure cross-chain transfers

**Bridge Times:**
- Transaction confirmation: 1-2 minutes
- Cross-chain processing: 10-15 minutes
- Token arrival: Automatic upon completion

## Supported Networks

### Testnets (Current)
- **Arbitrum Sepolia** - Primary testnet
- **Polygon Amoy** - Bridge destination

### Mainnet (Coming Soon)
- **Arbitrum One** - ZYL token deployed
- **Polygon** - Bridge support planned
- **Base** - Future expansion

## Token Addresses

### Arbitrum Sepolia (Testnet)
- ZYL Token: `0xB3F18c487c020A0EfD0dae6F1EDDbE24fcc757D0`
- Faucet: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- Staking: `0xC5E05EBA99784b00Dd0244c0E47A4DAe79F2eF72`
- Bridge: `0x20471cf7A5C04f0640d90584c0d42f01F74eC1B0`
- Swap Router: `0xCEd0B7e79cb93a8a58A152289939D0E050D21288`

### Arbitrum One (Mainnet)
- ZYL Token: `0x06D444C84Cf3d8E804710cec468B3F009dDd9663`

## Troubleshooting

### Common Issues

**Wallet won't connect:**
- Refresh the page
- Check wallet is unlocked
- Clear browser cache
- Try a different browser

**Transaction failed:**
- Check you have enough ETH for gas
- Increase gas limit if needed
- Wait and retry if network is congested

**Balance not updating:**
- Wait 10-15 seconds after transaction
- Refresh the page

**Faucet says "cooldown active":**
- Wait 24 hours from last claim
- Each address can claim once per day
- Cooldown timer shows exact remaining time

**Staking rewards not showing:**
- Rewards accumulate continuously (every second)
- Refresh the page to see latest amounts
- Make sure you're connected to the correct network

**Bridge taking too long:**
- Cross-chain transfers take 10-30 minutes
- Check destination chain after waiting
- Verify transaction on both chain explorers
- Contact support if over 1 hour

**Swap failing:**
- Ensure you have enough tokens for the swap
- Check that you've approved the token first
- Verify you have ETH for gas fees
- Try refreshing and reconnecting wallet

### Getting Help

**Live Application:** [https://zelion-bridge.windsurf.build/](https://zelion-bridge.windsurf.build/)
**Discord:** [Join our community](https://discord.gg/zelion)
**Twitter:** [@ZelionNetwork](https://twitter.com/zelionnetwork)
**Email:** support@zelion.network

### Block Explorers
- **Arbitrum Sepolia:** [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)
- **Polygon Amoy:** [https://amoy.polygonscan.com](https://amoy.polygonscan.com)

## Security Tips

1. **Never share your private keys**
2. **Always verify contract addresses**
3. **Start with small test amounts**
4. **Check URLs carefully** - Official site: https://zelion-bridge.windsurf.build/
5. **Be aware of scams** - Team will never DM first
6. **Double-check network** - Make sure you're on the correct testnet

## Contract Verification

All contracts are verified on:
- [Arbiscan Sepolia](https://sepolia.arbiscan.io)
- [Polygonscan Amoy](https://amoy.polygonscan.com)

Always verify contract addresses before interacting.

## Recent Updates

**Latest Version (January 2025):**
- ✅ Enhanced faucet with balance display and 24-hour cooldown timer
- ✅ Real-time staking balance and rewards tracking
- ✅ Improved swap interface with live balance updates
- ✅ Cross-chain bridge with Chainlink CCIP integration
- ✅ Responsive design for mobile and desktop
- ✅ Static site deployment for improved performance

---

*Last updated: January 2025*
*Version: 2.0.0*
*Live at: https://zelion-bridge.windsurf.build/*
