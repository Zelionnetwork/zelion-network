# Zelion Network MVP

Zelion Network is a cross-chain interoperability platform built on the Ethereum Virtual Machine (EVM) with support for Chainlink CCIP. This repository contains the smart contracts, frontend, and deployment scripts for the Minimum Viable Product (MVP) of the Zelion Network.

> 🔐 Secure. 🔁 Cross-Chain Ready. ⚙️ DeFi Functionality.

---

## 🚀 MVP Features

1. **Cross-Chain Interoperability**
   - Full integration with Arbitrum network
   - Chainlink CCIP support for cross-chain token transfers
   - Secure bridge contract with multi-token support

2. **DeFi Functionality**
   - Token swapping interface with AMM-style functionality
   - Staking dashboard with flexible and locked staking options
   - Real-time price feeds for tokens

3. **Security & Privacy**
   - Robust smart contract security using OpenZeppelin standards
   - Comprehensive audit checklist and documentation
   - Confidential transaction research for future enhancements
   - No collection of Personally Identifiable Information (PII)

4. **User Interface**
   - Intuitive React-based frontend
   - Integration with popular Web3 wallets
   - Dashboards for wallet balances, staking positions, and transaction history
   - Error handling and informative feedback

---

## 📁 Repository Structure

```bash
zelion-network/
├── contracts/                    # Smart contracts
│   ├── ZYLToken.sol              # Native ERC-20 Token (ZYL)
│   ├── Bridge.sol                # Main cross-chain bridge contract
│   ├── interfaces/               # Contract interfaces
│   └── ...                       # Additional contracts and tests
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/           # UI components (Swap, Staking, etc.)
│   │   ├── services/             # Backend integration services
│   │   └── ...
│   └── __tests__/                # Frontend test suite
├── test/                         # Smart contract test suite
├── scripts/                      # Deployment and utility scripts
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # Project dependencies
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
