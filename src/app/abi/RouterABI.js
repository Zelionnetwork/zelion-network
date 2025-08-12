export const RouterABI = [
  {
    "inputs": [
      { "internalType": "uint64", "name": "destinationChainSelector", "type": "uint64" },
      {
        "components": [
          { "internalType": "bytes", "name": "receiver", "type": "bytes" },
          { "internalType": "bytes", "name": "data", "type": "bytes" },
          {
            "components": [
              { "internalType": "address", "name": "token", "type": "address" },
              { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "internalType": "struct Client.EVMTokenAmount[]",
            "name": "tokenAmounts",
            "type": "tuple[]"
          },
          { "internalType": "bytes", "name": "extraArgs", "type": "bytes" },
          { "internalType": "address", "name": "feeToken", "type": "address" }
        ],
        "internalType": "struct Client.EVM2AnyMessage",
        "name": "message",
        "type": "tuple"
      }
    ],
    "name": "getFee",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
