# Zelion Network Cross-Chain Deployment Guide

This guide explains how to deploy the ZYL token and ZelionBridge contracts to multiple chains using Hardhat.

## Prerequisites

1. Ensure you have your private key and RPC URLs configured in your `.env` file
2. Make sure you have sufficient funds in your wallet for each network you want to deploy to

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PRIVATE_KEY=your_private_key_here

ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
ARBITRUM_ONE_RPC_URL=https://arb1.arbitrum.io/rpc
BNB_RPC_URL=https://bsc-dataseed.binance.org

ARBISCAN_API_KEY=your_arbiscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
BNBSCAN_API_KEY=your_bscscan_api_key_here
```

## Deployment Commands

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Deploy to Specific Networks

#### Arbitrum Sepolia (Testnet)
```bash
npm run deploy:arbitrum-sepolia
```

#### Polygon Amoy (Testnet)
```bash
npm run deploy:polygon-amoy
```

#### Arbitrum One (Mainnet)
```bash
npm run deploy:arbitrum-one
```

#### BNB Chain (Mainnet)
```bash
npm run deploy:bnb
```

## Deployment Verification

After deployment, you can verify all deployments with:

```bash
npx hardhat run scripts/verify-deployment.js
```

## Deployment Information

All deployment information will be saved in the `deployments/` directory with one JSON file per network.

## Network Configuration

The following networks are configured in `hardhat.config.js`:

- `arbitrumSepolia` - Arbitrum Sepolia testnet
- `polygonAmoy` - Polygon Amoy testnet
- `arbitrumOne` - Arbitrum One mainnet
- `bscMainnet` - BNB Chain mainnet

## Chainlink CCIP Router Addresses

The deployment scripts use the following Chainlink CCIP router addresses:

- Arbitrum Sepolia: `0x91a5632431a3191D105924634A770485c55C0E3a`
- Polygon Amoy: `0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2`
- Arbitrum One: `0x9C1dA9A04925bDfDedf0f6421bC7eEA26e793041`
- BNB Chain: `0x9C1dA9A04925bDfDedf0f6421bC7eEA26e793041`

## Security Considerations

1. Always verify the Chainlink CCIP router addresses before deployment
2. Ensure proper role assignments for the bridge contract
3. Verify all deployments on chain explorers
4. Test thoroughly on testnets before mainnet deployments
