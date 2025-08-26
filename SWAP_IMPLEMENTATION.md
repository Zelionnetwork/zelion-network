# Zelion Swap Implementation

## Overview
This document describes the implementation of the token swap functionality for the Zelion platform, supporting multiple chains including Arbitrum One, Arbitrum Sepolia, Polygon, and Polygon Amoy.

## Supported Chains
- **Arbitrum One** (Chain ID: 42161)
- **Arbitrum Sepolia** (Chain ID: 421614) 
- **Polygon** (Chain ID: 137)
- **Polygon Amoy** (Chain ID: 80002)

## Supported Tokens
- **ETH** - Native Ethereum
- **ZYL** - Zelion Token
- **USDC** - USD Coin
- **USDT** - Tether USD
- **DAI** - Dai Stablecoin
- **WETH** - Wrapped Ethereum

## Architecture

### Components
1. **SwapPanel.js** - Main swap interface component
2. **useSwap.js** - Custom React hook for swap functionality
3. **swapService.js** - Service layer for swap operations
4. **swap/page.js** - Swap page route

### Key Features
- ✅ Multi-chain support
- ✅ Token balance checking
- ✅ Real-time price quotes
- ✅ Slippage tolerance settings
- ✅ Transaction execution
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## Implementation Details

### SwapPanel Component
The main swap interface includes:
- Token selection dropdowns
- Amount input fields
- Slippage tolerance settings
- Balance display
- Price impact information
- Transaction status

### useSwap Hook
Provides the following functionality:
- `getTokenBalance()` - Fetch token balances
- `getSwapQuote()` - Get swap quotes with price impact
- `executeSwap()` - Execute swap transactions
- `approveToken()` - Approve token spending
- `checkTokenAllowance()` - Check token allowances

### SwapService
Core service layer with:
- Token address management per chain
- Balance and allowance checking
- Quote calculation (currently mock implementation)
- Swap execution (currently mock implementation)

## Configuration

### Chain Configuration
Chains are configured in `src/app/providers.js`:
```javascript
chains: [mainnet, polygon, arbitrum, optimism, arbitrumSepolia, polygonAmoy]
```

### Token Addresses
Token addresses are managed in `src/app/services/swapService.js`:
```javascript
getTokenAddresses(chainId) {
  const addresses = {
    42161: { // Arbitrum One
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      // ... more tokens
    },
    // ... other chains
  };
}
```

## Usage

### Accessing the Swap
1. Navigate to `/swap` in the application
2. Connect your wallet
3. Select the desired network
4. Choose tokens to swap
5. Enter amount and slippage tolerance
6. Execute the swap

### Navigation
The swap functionality is accessible via:
- Navigation menu: "Swap" link
- Direct URL: `/swap`

## Current Status

### ✅ Completed
- [x] Multi-chain configuration
- [x] Swap UI component
- [x] Custom swap hook
- [x] Service layer architecture
- [x] Navigation integration
- [x] Error handling
- [x] Loading states
- [x] Responsive design

### 🔄 Mock Implementation
The following features currently use mock data and need real DEX integration:
- Price quotes (using mock prices)
- Swap execution (simulated transactions)
- Token allowances (basic implementation)

### 🚧 Next Steps
1. **DEX Integration**
   - Integrate with Uniswap V3 or similar DEX
   - Implement real price feeds
   - Add actual swap execution

2. **Token Support**
   - Add more token addresses for each chain
   - Implement token discovery
   - Add custom token support

3. **Advanced Features**
   - Multi-hop swaps
   - MEV protection
   - Gas optimization
   - Transaction history

4. **Testing**
   - Unit tests for swap logic
   - Integration tests with testnets
   - End-to-end testing

## Security Considerations
- All transactions require user approval
- Slippage protection implemented
- Input validation for amounts and addresses
- Error handling for failed transactions

## Dependencies
- `wagmi` - Ethereum wallet integration
- `ethers` - Ethereum utilities
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `lucide-react` - Icons
- `framer-motion` - Animations

## Development
To run the swap functionality:
```bash
npm run dev
```

Navigate to `http://localhost:3000/swap` to access the swap interface.

## Notes
- The current implementation uses mock data for demonstration purposes
- Real DEX integration requires additional configuration and testing
- Token addresses need to be updated with actual contract addresses
- Price feeds should be replaced with real market data sources
