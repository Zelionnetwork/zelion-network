const { ethers } = require('ethers');

async function findWhitelistedToken() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // Faucet with ZYL tokens
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  console.log('Finding whitelisted ZYL token in faucet...\n');
  
  // Check if contracts from frontend config are whitelisted
  const checkAddresses = [
    '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Current ZYL in frontend
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Listed as SimpleSwap
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',  // Listed as Staking
    // Check addresses near the faucet (common deployment pattern)
    '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7BF',
    '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C1',
  ];
  
  const faucetAbi = [
    'function tokenWhitelist(address) view returns (bool)',
    'function owner() view returns (address)'
  ];
  
  const faucet = new ethers.Contract(FAUCET, faucetAbi, provider);
  
  // Check faucet owner
  try {
    const owner = await faucet.owner();
    console.log('Faucet owner:', owner);
  } catch (e) {
    console.log('Could not read faucet owner');
  }
  
  console.log('\nChecking for whitelisted tokens:');
  
  for (const addr of checkAddresses) {
    try {
      const isWhitelisted = await faucet.tokenWhitelist(addr);
      
      if (isWhitelisted) {
        console.log(`\n✅ WHITELISTED: ${addr}`);
        
        // Check if it's a token with balance
        const tokenAbi = [
          'function symbol() view returns (string)',
          'function balanceOf(address) view returns (uint256)'
        ];
        
        try {
          const token = new ethers.Contract(addr, tokenAbi, provider);
          const symbol = await token.symbol();
          const balance = await token.balanceOf(FAUCET);
          
          console.log(`  Symbol: ${symbol}`);
          console.log(`  Faucet balance: ${ethers.formatEther(balance)} tokens`);
          
          if (symbol === 'ZYL' && balance > 0n) {
            console.log('\n🎯 FOUND THE ZYL TOKEN!');
            console.log(`Update frontend addresses.js:`);
            console.log(`ZYLToken: "${addr}"`);
            return addr;
          }
        } catch (e) {
          console.log('  Not an ERC20 token or error reading');
        }
      }
    } catch (e) {
      // Not whitelisted or error
    }
  }
  
  console.log('\n❌ Could not find whitelisted ZYL token');
  console.log('The actual ZYL token address needs to be provided');
}

findWhitelistedToken().catch(console.error);
