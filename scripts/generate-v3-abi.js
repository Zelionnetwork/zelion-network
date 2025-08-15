const fs = require('fs');
const path = require('path');

// Manually define the ZelionBridgeV3 ABI based on the contract
const abi = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "messageId", "type": "bytes32" },
      { "indexed": true, "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" },
      { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "TokensBridged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "messageId", "type": "bytes32" },
      { "indexed": true, "internalType": "uint64", "name": "sourceChainSelector", "type": "uint64" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "TokensReceived",
    "type": "event"
  },
  // Main functions
  {
    "inputs": [
      { "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" },
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "bridgeTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "estimateBridgeFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "bool", "name": "isSupported", "type": "bool" },
      { "internalType": "bool", "name": "isBurnable", "type": "bool" },
      { "internalType": "address", "name": "destToken", "type": "address" },
      { "internalType": "uint64", "name": "destChainSelector", "type": "uint64" }
    ],
    "name": "configureToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "chainSelector", "type": "uint64" },
      { "internalType": "address", "name": "bridgeAddress", "type": "address" }
    ],
    "name": "setTrustedBridge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "routerAddress", "type": "address" }],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "tokenConfigs",
    "outputs": [
      { "internalType": "bool", "name": "isSupported", "type": "bool" },
      { "internalType": "bool", "name": "isBurnable", "type": "bool" },
      { "internalType": "address", "name": "destinationToken", "type": "address" },
      { "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "name": "trustedBridges",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "router",
    "outputs": [{ "internalType": "contract IRouterClient", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // CCIP Receiver
  {
    "inputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "messageId", "type": "bytes32" },
          { "internalType": "uint64", "name": "sourceChainSelector", "type": "uint64" },
          { "internalType": "bytes", "name": "sender", "type": "bytes" },
          { "internalType": "bytes", "name": "data", "type": "bytes" },
          {
            "components": [
              { "internalType": "address", "name": "token", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "internalType": "struct Client.EVMTokenAmount[]",
            "name": "destTokenAmounts",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Client.Any2EVMMessage",
        "name": "message",
        "type": "tuple"
      }
    ],
    "name": "ccipReceive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Save to frontend directory
const outputPath = path.join(__dirname, '../../zelion-site/src/app/abi/ZelionBridgeABI.json');
fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

console.log('✅ ZelionBridgeV3 ABI generated and saved to frontend');
console.log(`ABI has ${abi.length} entries`);
