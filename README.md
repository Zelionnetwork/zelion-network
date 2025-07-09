# Zylithium Chain v1.0 — Phase 1

Zylithium Chain is a post-quantum, cross-chain interoperability platform built on the Ethereum Virtual Machine (EVM). This repository contains the smart contracts and deployment scripts for **Phase 1** of the project.

> 🔐 Quantum-Secure. 🔁 Cross-Chain Ready. ⚙️ Modular Architecture.

---

## 📁 Structure

```bash
zylithium-chain/
├── contracts/
│   ├── ZYLToken.sol              # Native ERC-20 Token (ZYL)
│   └── CrossChainTransfer.sol    # Cross-chain bridge contract (EVM-compatible)
├── scripts/
│   ├── deployToken.js            # Deploys ZYLToken
│   └── deployBridge.js           # Deploys CrossChainTransfer
├── hardhat.config.js             # Hardhat setup with multiple EVM networks
├── .env                          # Stores private keys & RPCs securely
├── README.md                     # You're here.
