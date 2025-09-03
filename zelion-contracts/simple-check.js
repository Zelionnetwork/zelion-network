const { ethers } = require('ethers');

async function check() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // The actual deployed addresses based on your confirmation
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Since the faucet has ZYL tokens, but 0x5FbDB... doesn't work,
  // the ZYL token must be at a different address
  
  // Let me check if the other listed contracts are actually the ZYL token
  const possibleZYL = [
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Listed as SimpleSwap
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',  // Listed as Staking
  ];
  
  console.log('Finding the real ZYL token address...\n');
  
  for (const addr of possibleZYL) {
    const code = await provider.getCode(addr);
    if (code !== '0x') {
      console.log(`Checking ${addr}...`);
      try {
        const token = new ethers.Contract(
          addr,
          ['function symbol() view returns (string)', 'function balanceOf(address) view returns (uint256)'],
          provider
        );
        const symbol = await token.symbol();
        const balance = await token.balanceOf(FAUCET);
        console.log(`  Symbol: ${symbol}, Faucet balance: ${ethers.formatEther(balance)}`);
        
        if (balance > 0n) {
          console.log(`  ✅ This token has balance in faucet!`);
          return addr;
        }
      } catch (e) {
        console.log(`  Not an ERC20 token`);
      }
    }
  }
}

check().catch(console.error);
