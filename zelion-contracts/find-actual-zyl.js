const { ethers } = require('ethers');

async function findActualZYL() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // Known working faucet with ZYL tokens
  const FAUCET_ADDRESS = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  console.log('Searching for actual ZYL token address...\n');
  
  // The ZYL token is NOT at 0x5FbDB2315678afecb367f032d93F642f64180aa3
  // Need to find where it actually is
  
  // Based on the faucet address pattern, the ZYL token is likely deployed by same deployer
  // Check addresses that could be the ZYL token
  
  // Since faucet has ZYL, we need to find what token is whitelisted
  // Let's check the deployment addresses from the memories
  const checkAddresses = [
    // From memories - these were the actual deployed addresses
    '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Listed as ZYL (but not working)
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Listed as SimpleSwap
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',  // Listed as Staking
    // Other possible addresses
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  ];
  
  // First check what's deployed
  console.log('Checking deployed contracts:');
  for (const addr of checkAddresses) {
    const code = await provider.getCode(addr);
    if (code !== '0x') {
      console.log(`✅ Contract deployed at: ${addr}`);
      
      // Try to read as token
      try {
        const tokenAbi = ['function symbol() view returns (string)'];
        const token = new ethers.Contract(addr, tokenAbi, provider);
        const symbol = await token.symbol();
        console.log(`   Symbol: ${symbol}`);
        
        if (symbol === 'ZYL') {
          console.log('   🎯 This is the ZYL token!');
          
          // Check faucet balance
          const balAbi = ['function balanceOf(address) view returns (uint256)'];
          const tokenBal = new ethers.Contract(addr, balAbi, provider);
          const balance = await tokenBal.balanceOf(FAUCET_ADDRESS);
          console.log(`   Faucet balance: ${ethers.formatEther(balance)} ZYL`);
          
          return addr;
        }
      } catch (e) {
        // Not a token
      }
    }
  }
  
  console.log('\nZYL token address not found in common locations.');
  console.log('The token must be at a different address.');
}

findActualZYL().then(addr => {
  if (addr) {
    console.log(`\nUpdate frontend with ZYL address: ${addr}`);
  }
}).catch(console.error);
