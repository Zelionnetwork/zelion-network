// ZYL Token addresses on different chains
export const ZYL_TOKEN_ADDRESSES = {
  'Arbitrum Sepolia': '0x6953C136c5816AdA72C2Ca72349431F2C81CC6e9',
  'Arbitrum One': '0x0000000000000000000000000000000000000000', // Add actual address
  'Polygon': '0x0000000000000000000000000000000000000000', // Add actual address
  'Polygon Amoy': '0x0000000000000000000000000000000000000000', // Add actual address
};

export const CHAIN_SELECTORS = {
  'Ethereum Mainnet': 16015286601757825753n,
  'Ethereum Sepolia': 16015286601757825753n,
  'Polygon': 12532609583862916517n,
  'Polygon Amoy': 80002n,
  'Arbitrum One': 10364719886407610861n,
  'Arbitrum Sepolia': 421614n,
  'Optimism': 26643633872676945n,
  'Optimism Goerli': 26643633872676945n,
  'Base': 10364719886407610861n,
  'Base Sepolia': 10364719886407610861n,
  'Avalanche': 14767482510784806043n,
  'Avalanche Fuji': 14767482510784806043n,
  'BNB Chain': 13264668187771770619n,
  'BNB Testnet': 13264668187771770619n,
};

export const ZELION_BRIDGE_ADDRESS = '0xC882b481478F2431c29518932A52978dfb7407E1';

export const isChainSupported = (chainName) => {
  return CHAIN_SELECTORS.hasOwnProperty(chainName);
};

export const getChainSelector = (chainName) => {
  return CHAIN_SELECTORS[chainName];
};

export const getTokenAddress = (chainName) => {
  return ZYL_TOKEN_ADDRESSES[chainName];
};
