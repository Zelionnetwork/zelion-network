// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  42161: { // Arbitrum One (Mainnet)
    ZYLToken: "0x06D444C84Cf3d8E804710cec468B3F009dDd9663", // Deployed on mainnet
    Faucet: null, // Not deployed on mainnet yet
    SimpleSwap: null, // Not deployed on mainnet yet
    Staking: null // Not deployed on mainnet yet
  },
  421614: { // Arbitrum Sepolia
    ZYLToken: "0xd873a2649c7e1e020C2249A4aaaA248eC02d837B", // Correct deployed address
    Faucet: "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0", // Correct deployed address
    SimpleSwap: "0xCEd0B7e79cb93a8a58A152289939D0E050D21288", // SwapRouter address
    Staking: "0xdf0eAf7a0Cc0c6DE5944628BaEa95f3BD5105Cff" // Correct deployed address
  },
  80002: { // Polygon Amoy
    ZYLToken: "0xAeeEe926B74039C0B7E37A2139d18DCa9edBd0f3",
    Faucet: "0x78F476258cc19Dfbc89dA6e9B9CC1198290a84Cc",
    SimpleSwap: "0x61c505d766c542963BC01102F611a1A3066a0A0A",
    Staking: "0x8736885ef22813aDa6Fd927400783E9E2721Fb0e"
  }
};

// Token addresses for different chains
export const TOKEN_ADDRESSES = {
  42161: { // Arbitrum One (Mainnet)
    ZYL: "0x06D444C84Cf3d8E804710cec468B3F009dDd9663", // ZYL token deployed on mainnet
    ETH: "0x0000000000000000000000000000000000000000",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Arbitrum mainnet WETH
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum mainnet USDC
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum mainnet USDT
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" // Arbitrum mainnet DAI
  },
  421614: { // Arbitrum Sepolia
    ZYL: "0xd873a2649c7e1e020C2249A4aaaA248eC02d837B", // Correct ZYL token address
    ETH: "0x0000000000000000000000000000000000000000",
    WETH: "0x5647C0d20CE3D2B91A2Df24C0886278F865bd58D", // Arbitrum Sepolia WETH
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
    USDT: "0x6f7C932e7684666C9fd1d44527765433e01fF61d" // Arbitrum Sepolia USDT
  },
  80002: { // Polygon Amoy
    ZYL: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MATIC: "0x0000000000000000000000000000000000000000",
    WMATIC: "0xAa5C4c96AA7D94a65b59E282Ea16fb7C8a9e9e96",
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    USDT: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    DAI: "0x6D0F8D488B669aa9BA2D0f0b7B75a88bf5051CD3"
  }
};

export const getContractAddress = (chainId, contractName) => {
  if (!chainId || !contractName) return null;
  const addresses = CONTRACT_ADDRESSES[chainId];
  return addresses ? addresses[contractName] || null : null;
};

export const getTokenAddress = (chainId, tokenSymbol) => {
  if (!chainId || !tokenSymbol) return null;
  const addresses = TOKEN_ADDRESSES[chainId];
  return addresses ? addresses[tokenSymbol] || null : null;
};
