const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses
const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log('Wallet:', wallet.address);

// Create contracts
const zylToken = new ethers.Contract(
  ZYL_TOKEN,
  [
    'function owner() view returns (address)',
    'function balanceOf(address) view returns (uint256)',
    'function mint(address to, uint256 amount)'
  ],
  wallet
);

const faucet = new ethers.Contract(
  FAUCET,
  [
    'function tokenWhitelist(address) view returns (bool)',
    'function whitelistToken(address token, bool status)'
  ],
  wallet
);

// Execute minting
zylToken.owner().then(owner => {
  console.log('Owner:', owner);
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log('ERROR: Not the owner');
    return;
  }
  
  // Check balance first
  return zylToken.balanceOf(FAUCET);
}).then(balance => {
  if (balance !== undefined) {
    console.log('Current faucet balance:', ethers.formatEther(balance), 'ZYL');
    
    // Mint 1M tokens
    console.log('Minting 1,000,000 ZYL...');
    return zylToken.mint(FAUCET, ethers.parseEther('1000000'));
  }
}).then(tx => {
  if (tx) {
    console.log('TX:', tx.hash);
    return tx.wait();
  }
}).then(receipt => {
  if (receipt) {
    console.log('✅ Minted! Block:', receipt.blockNumber);
    
    // Check whitelist
    return faucet.tokenWhitelist(ZYL_TOKEN);
  }
}).then(isWhitelisted => {
  if (isWhitelisted !== undefined) {
    console.log('Whitelisted:', isWhitelisted);
    
    if (!isWhitelisted) {
      console.log('Whitelisting...');
      return faucet.whitelistToken(ZYL_TOKEN, true);
    } else {
      console.log('✅ Already whitelisted!');
      console.log('\n🎉 Faucet is ready!');
    }
  }
}).then(tx => {
  if (tx) {
    console.log('Whitelist TX:', tx.hash);
    return tx.wait();
  }
}).then(receipt => {
  if (receipt) {
    console.log('✅ Whitelisted!');
    console.log('\n🎉 Faucet is ready!');
  }
}).catch(error => {
  console.error('ERROR:', error.message);
});
