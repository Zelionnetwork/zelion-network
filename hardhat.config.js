require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

const {
  PRIVATE_KEY,
  ARBITRUM_SEPOLIA_RPC_URL,
  POLYGON_AMOY_RPC_URL,
  ARBITRUM_ONE_RPC_URL,
  BNB_RPC_URL,
  ARBISCAN_API_KEY,
  POLYGONSCAN_API_KEY,
} = process.env;

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

if (accounts.length === 0) {
  console.warn("\n[WARNING] No private key found. Please ensure PRIVATE_KEY is set in your .env file.\n");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    "arbitrum-sepolia": {
      url: ARBITRUM_SEPOLIA_RPC_URL || "",
      accounts: accounts,
      chainId: 421614,
    },
    polygonAmoy: {
      url: POLYGON_AMOY_RPC_URL || "",
      accounts,
      chainId: 80002,
    },
    arbitrumOne: {
      url: ARBITRUM_ONE_RPC_URL || "",
      accounts,
      chainId: 42161,
    },
    bscMainnet: {
      url: BNB_RPC_URL || "",
      accounts,
      chainId: 56,
      gasPrice: 20000000000,
    },
  },
  sourcify: {
    enabled: true
  },
  etherscan: {
    apiKey: {
      "arbitrum-sepolia": ARBISCAN_API_KEY,
      polygonAmoy: POLYGONSCAN_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY
    },
    customChains: [
      {
        network: "arbitrum-sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      },
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
