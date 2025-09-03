const { ethers } = require('ethers');

async function getRealAddresses() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  console.log('Finding actual deployed contracts...\n');
  
  // Faucet confirmed working
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Check if faucet is deployed
  const faucetCode = await provider.getCode(FAUCET);
  if (faucetCode === '0x') {
    console.log('❌ Faucet not found at expected address');
    return;
  }
  
  console.log('✅ Faucet deployed at:', FAUCET);
  
  // Get whitelisted tokens from faucet
  const faucetAbi = [
    'function tokenWhitelist(address) view returns (bool)',
    'function owner() view returns (address)'
  ];
  
  const faucet = new ethers.Contract(FAUCET, faucetAbi, provider);
  
  // Check a range of possible token addresses
  // Since user says faucet has ZYL, the token must be deployed somewhere
  
  // Common deployment patterns - check addresses near the faucet
  const baseAddr = BigInt(FAUCET);
  const addresses = [];
  
  // Check 20 addresses before and after faucet
  for (let i = -20; i <= 20; i++) {
    const addr = '0x' + (baseAddr + BigInt(i)).toString(16).padStart(40, '0');
    addresses.push(addr);
  }
  
  // Also check the addresses from frontend config
  addresses.push('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  addresses.push('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  addresses.push('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
  
  console.log('Scanning for ZYL token...');
  
  for (const addr of addresses) {
    try {
      // Check if whitelisted in faucet
      const isWhitelisted = await faucet.tokenWhitelist(addr);
      
      if (isWhitelisted) {
        console.log(`\n✅ FOUND WHITELISTED TOKEN: ${addr}`);
        
        // Verify it's ZYL
        const tokenAbi = [
          'function symbol() view returns (string)',
          'function name() view returns (string)',
          'function balanceOf(address) view returns (uint256)'
        ];
        
        const token = new ethers.Contract(addr, tokenAbi, provider);
        
        try {
          const symbol = await token.symbol();
          const name = await token.name();
          const balance = await token.balanceOf(FAUCET);
          
          console.log(`  Symbol: ${symbol}`);
          console.log(`  Name: ${name}`);
          console.log(`  Faucet Balance: ${ethers.formatEther(balance)} tokens`);
          
          if (symbol === 'ZYL') {
            console.log('\n🎯 This is the ZYL token!');
            console.log('Update frontend addresses.js with:');
            console.log(`ZYLToken: "${addr}"`);
            return addr;
          }
        } catch (e) {
          console.log('  Error reading token:', e.message);
        }
      }
    } catch (e) {
      // Continue checking
    }
  }
  
  console.log('\nCould not find whitelisted ZYL token automatically');
}

getRealAddresses().catch(console.error);
