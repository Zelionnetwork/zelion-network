# 🌉 Zelion Network - Cross-Chain Bridge

**Live Application**: https://zelion-bridge-v2.windsurf.build

Zelion Network is a production-ready cross-chain interoperability platform built with Chainlink CCIP integration. Our bridge enables seamless token transfers across multiple EVM-compatible networks with accurate fee estimation and optimized user experience.

> 🔐 **Secure** • 🌉 **Cross-Chain Ready** • ⚡ **Production Deployed** • 🧪 **Community Tested**

## 🎉 Latest Updates

- **✅ Fee Buffer Optimization**: Implemented 50% fee buffer for reliable CCIP transactions
- **✅ ZelionBridgeV3 Deployed**: Message-only architecture for non-whitelisted tokens
- **✅ Frontend Enhanced**: Dynamic imports, improved error handling, token faucet integration
- **✅ Public Testing Ready**: Bridge fully operational on Arbitrum Sepolia

## 🚀 **Live Cross-Chain Bridge Features**

✅ **Multi-Chain Support**
- **Arbitrum Sepolia** ↔ **Polygon Amoy** ↔ **Avalanche Fuji**
- Real-time cross-chain token transfers
- Accurate fee estimation (~$0.06-0.09 per transfer)

✅ **Smart Token Management**
- ZYL (Zelion Token) and CCIP-BnM test token support
- Intelligent approval management (skips redundant approvals)
- Multi-token architecture ready for expansion

✅ **Production-Ready UX**
- Wallet integration (MetaMask, WalletConnect, etc.)
- Real-time balance updates and transaction status
- Comprehensive error handling and user feedback
- Responsive design for all devices

---

## 🎯 **Quick Start - Try the Bridge Now!**

1. **Visit**: https://zelion-bridge.windsurf.build
2. **Connect Wallet**: Use MetaMask or any Web3 wallet
3. **Switch to Arbitrum Sepolia**: Add testnet if needed
4. **Get Test Tokens**: 
   - ZYL tokens: Use our minting interface
   - CCIP-BnM: Use Chainlink faucet
5. **Bridge Tokens**: Select destination chain and amount
6. **Confirm Transaction**: Approve and execute the bridge

## 🏗️ **Technical Architecture**

### Smart Contracts
- **ZelionBridgeV3.sol**: Message-only CCIP bridge (burns/mints tokens)
- **ZYLToken.sol**: ERC20 token with bridge role management
- **Upgradeable**: UUPS proxy pattern for future enhancements
- **Fee Buffer**: 50% buffer on CCIP fees for reliable transactions

### Chainlink CCIP Integration
- Native CCIP router integration for secure cross-chain messaging
- Support for CCIP-whitelisted tokens (CCIP-BnM for testing)
- Accurate fee estimation using Chainlink's getFee() function


**🎨 Frontend Technology**
- Next.js 15 with React 19 for modern web experience
- Wagmi + RainbowKit for seamless wallet integration
- Ethers.js and Viem for blockchain interactions
- Tailwind CSS for responsive, beautiful UI

## 📋 **Deployed Contract Addresses**

### **Arbitrum Sepolia Testnet**
- **CrossChainTransfer**: `0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4`
- **ZYL Token**: `0xd53E07D67d30cE5562e8C0aE6e569b4FAf830A45`
- **ZelionBridgeV3**: `0xfB89C3Ea94A6750446E394110334Fb6a8B3a7f61`
- **CCIP Router**: `0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165`
- **CCIP-BnM Token**: `0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D`

### **Chain Selectors**
- **Arbitrum Sepolia**: `3478487238524512106`
- **Polygon Amoy**: `16281711391670634445`
- **Avalanche Fuji**: `14767482510784806043`

## 🛠️ **Development Setup**

```bash
# Clone the repository
git clone https://github.com/Zelionnetwork/zelion-network.git
cd zelion-network

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your private key and RPC URLs

# Deploy contracts (if needed)
npx hardhat run scripts/deploy.js --network arbitrum-sepolia

# Start frontend development
cd zelion-site
npm install
npm run dev
```

## 📁 **Repository Structure**

```bash
zelion-network/
├── contracts/                    # Smart contracts
│   ├── CrossChainTransfer.sol    # Main bridge contract
│   ├── ZYLToken.sol              # Native ERC-20 Token (ZYL)
│   ├── interfaces/               # Contract interfaces
│   └── test/                     # Contract tests
├── zelion-site/                  # Next.js frontend application
│   ├── src/app/
│   │   ├── components/           # UI components (Bridge, Dashboard, etc.)
│   │   ├── services/             # Blockchain integration services
│   │   ├── hooks/                # Custom React hooks
│   │   └── abi/                  # Contract ABIs
│   └── public/                   # Static assets
├── scripts/                      # Deployment and utility scripts
└── test/                         # Smart contract test suite
├── scripts/                      # Deployment and utility scripts
├── hardhat.config.js             # Hardhat configuration
└── package.json                  # Project dependencies
```

## 🧪 **Testing & Validation**

The bridge has been thoroughly tested with:

- **End-to-End Bridge Flows**: Complete token transfers across all supported chains
- **Fee Estimation Accuracy**: Validated ~$0.06-0.09 costs for cross-chain transfers  
- **Approval Optimization**: Smart allowance checking to minimize user transactions
- **Error Handling**: Comprehensive testing of edge cases and failure scenarios
- **Multi-Token Support**: Validated with both ZYL and CCIP-BnM test tokens

## 🚀 **Recent Improvements**

- ✅ **Fixed Fee Estimation**: Resolved frontend crashes and display issues
- ✅ **Optimized Approvals**: Smart allowance checking prevents redundant transactions
- ✅ **Enhanced UX**: Better error handling and user feedback
- ✅ **Multi-Token Support**: Dynamic token selection with CCIP indicators
- ✅ **Production Deployment**: Live application ready for community testing

## 🤝 **Contributing**

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 **Links**

- **Live Bridge**: https://zelion-bridge.windsurf.build
- **GitHub**: https://github.com/Zelionnetwork/zelion-network
- **Documentation**: Coming soon
- **Community**: Join our Discord (link coming soon)

---

**Built with ❤️ by the Zelion Network Team**
├── AUDIT_CHECKLIST.md            # Security audit preparation
├── CONFIDENTIAL_TRANSACTIONS_RESEARCH.md  # Privacy research
└── README.md                     # You're here
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hardhat

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zelion-network.git
   cd zelion-network
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For frontend development:
   ```bash
   cd frontend
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
PRIVATE_KEY=your_private_key
ARBITRUM_SEPOLIA_RPC_URL=your_arbitrum_sepolia_rpc_url
POLYGON_AMOY_RPC_URL=your_polygon_amoy_rpc_url
```

### Testing

Run smart contract tests:
```bash
npx hardhat test
```

Run frontend tests:
```bash
cd frontend
npm test
```

### Deployment

Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 📋 Audit Preparation

The repository includes a comprehensive audit checklist (`AUDIT_CHECKLIST.md`) and confidential transaction research (`CONFIDENTIAL_TRANSACTIONS_RESEARCH.md`) to prepare for third-party security audits.

---

## 📚 Technical Stack

- **Blockchain Platform**: Arbitrum (Layer 2 Ethereum Rollup)
- **Smart Contracts**: Solidity
- **Cross-Chain Interoperability**: Chainlink CCIP
- **Frontend Framework**: React.js
- **Web3 Libraries**: Ethers.js
- **Wallet Integration**: MetaMask, WalletConnect
- **Development Environment**: Hardhat
- **Security Libraries**: OpenZeppelin Contracts
- **Testing Frameworks**: Hardhat, Jest
