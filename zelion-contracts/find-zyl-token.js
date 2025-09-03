const { ethers } = require('ethers');

async function findZYLToken() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // Faucet confirmed at this address with ZYL tokens
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  console.log('Finding ZYL token address...\n');
  
  // The ZYL token must be deployed somewhere else since 0x5FbDB... returns no data
  // Check if there are any transactions from the faucet that reveal the token
  
  // Try some common deployment address patterns
  // When contracts are deployed in sequence, they often have similar addresses
  
  // Based on faucet at 0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0
  // The token might be at a nearby address
  
  const possibleAddresses = [
    // Addresses that might be ZYL based on deployment patterns
    '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7BF', // One before faucet
    '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C1', // One after faucet
    '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Current (not working)
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Common hardhat
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Listed as SimpleSwap
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Listed as Staking
    // Try some other common patterns
    '0x0000000000000000000000000000000000000001',
    '0x1000000000000000000000000000000000000001',
  ];
  
  for (const addr of possibleAddresses) {
    try {
      const code = await provider.getCode(addr);
      if (code !== '0x' && code.length > 100) {
        console.log(`Checking ${addr}...`);
        
        // Try to read token properties
        const tokenAbi = [
          'function symbol() view returns (string)',
          'function balanceOf(address) view returns (uint256)',
          'function name() view returns (string)'
        ];
        
        const token = new ethers.Contract(addr, tokenAbi, provider);
        
        try {
          const symbol = await token.symbol();
          const name = await token.name();
          const faucetBalance = await token.balanceOf(FAUCET);
          
          console.log(`  Symbol: ${symbol}, Name: ${name}`);
          console.log(`  Faucet balance: ${ethers.formatEther(faucetBalance)} tokens`);
          
          if (symbol === 'ZYL' && faucetBalance > 0) {
            console.log(`\n✅ FOUND ZYL TOKEN at: ${addr}`);
            console.log(`   Faucet has ${ethers.formatEther(faucetBalance)} ZYL`);
            return addr;
          }
        } catch (e) {
          // Not an ERC20 token or error reading
        }
      }
    } catch (e) {
      // Error checking address
    }
  }
  
  console.log('\nCould not find ZYL token address automatically.');
  console.log('The token must be at a different address.');
  console.log('You may need to check Arbiscan or deployment logs.');
}

findZYLToken().catch(console.error);
