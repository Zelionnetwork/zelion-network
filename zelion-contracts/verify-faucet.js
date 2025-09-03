const { ethers } = require('ethers');

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    
    // Faucet with ZYL tokens
    const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
    
    // Check faucet
    const code = await provider.getCode(FAUCET);
    console.log('Faucet deployed:', code !== '0x');
    
    // Since user confirmed faucet has ZYL, find the actual token address
    // The token must be at a different address than 0x5FbDB2315678afecb367f032d93F642f64180aa3
    
    // Try addresses that might be the real ZYL token
    const possibleTokens = [
      '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7BF', // Near faucet
      '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C1', // Near faucet
      '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Listed as swap
      '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',  // Listed as staking
    ];
    
    for (const addr of possibleTokens) {
      const tokenCode = await provider.getCode(addr);
      if (tokenCode !== '0x') {
        console.log(`Contract at ${addr}: deployed`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
