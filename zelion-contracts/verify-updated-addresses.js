const { ethers } = require('ethers');

async function verifyAddresses() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  console.log('Verifying updated contract addresses...\n');
  
  // Updated addresses
  const contracts = {
    ZYLToken: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Swapped with SimpleSwap
    Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    SimpleSwap: '0x5FbDB2315678afecb367f032d93F642f64180aa3',  // Swapped with ZYL
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  };
  
  // Check deployment status
  for (const [name, addr] of Object.entries(contracts)) {
    const code = await provider.getCode(addr);
    console.log(`${name}: ${code !== '0x' ? '✅ DEPLOYED' : '❌ NOT DEPLOYED'} at ${addr}`);
  }
  
  // Test ZYL token functions
  console.log('\nTesting ZYL token at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0:');
  try {
    const tokenAbi = [
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'function balanceOf(address) view returns (uint256)',
      'function totalSupply() view returns (uint256)'
    ];
    
    const token = new ethers.Contract(contracts.ZYLToken, tokenAbi, provider);
    
    const symbol = await token.symbol();
    const name = await token.name();
    const totalSupply = await token.totalSupply();
    const faucetBalance = await token.balanceOf(contracts.Faucet);
    
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Name: ${name}`);
    console.log(`  Total Supply: ${ethers.formatEther(totalSupply)} tokens`);
    console.log(`  Faucet Balance: ${ethers.formatEther(faucetBalance)} tokens`);
    
    if (symbol === 'ZYL' && faucetBalance > 0n) {
      console.log('\n✅ ZYL TOKEN VERIFIED! Faucet has tokens.');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('This may not be the ZYL token.');
  }
  
  // Test faucet whitelist
  console.log('\nTesting faucet configuration:');
  try {
    const faucetAbi = [
      'function tokenWhitelist(address) view returns (bool)',
      'function requestAmount() view returns (uint256)',
      'function cooldownTime() view returns (uint256)'
    ];
    
    const faucet = new ethers.Contract(contracts.Faucet, faucetAbi, provider);
    const isWhitelisted = await faucet.tokenWhitelist(contracts.ZYLToken);
    const requestAmount = await faucet.requestAmount();
    const cooldown = await faucet.cooldownTime();
    
    console.log(`  ZYL whitelisted: ${isWhitelisted ? '✅ YES' : '❌ NO'}`);
    console.log(`  Request amount: ${ethers.formatEther(requestAmount)} ZYL`);
    console.log(`  Cooldown: ${cooldown / 3600}h`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

verifyAddresses().catch(console.error);
