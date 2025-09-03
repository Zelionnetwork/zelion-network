const { ethers } = require('ethers');

async function verifyState() {
  console.log('Checking Arbitrum Sepolia deployment...\n');
  
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  const addresses = {
    ZYLToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    SimpleSwap: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  };
  
  // Check if contracts exist
  console.log('Contract deployment status:');
  for (const [name, address] of Object.entries(addresses)) {
    const code = await provider.getCode(address);
    console.log(`${name}: ${code !== '0x' ? '✅ DEPLOYED' : '❌ NOT DEPLOYED'} at ${address}`);
  }
  
  // Check ZYL balance in faucet
  console.log('\nChecking faucet ZYL balance...');
  const zylAbi = [
    'function balanceOf(address) view returns (uint256)',
    'function owner() view returns (address)'
  ];
  
  try {
    const zylToken = new ethers.Contract(addresses.ZYLToken, zylAbi, provider);
    const faucetBalance = await zylToken.balanceOf(addresses.Faucet);
    console.log(`Faucet ZYL balance: ${ethers.formatEther(faucetBalance)} ZYL`);
    
    const owner = await zylToken.owner();
    console.log(`ZYL Token owner: ${owner}`);
  } catch (error) {
    console.log('❌ Cannot read ZYL token - contract may not be deployed');
  }
  
  // Check faucet whitelist
  console.log('\nChecking faucet configuration...');
  const faucetAbi = [
    'function tokenWhitelist(address) view returns (bool)',
    'function owner() view returns (address)'
  ];
  
  try {
    const faucet = new ethers.Contract(addresses.Faucet, faucetAbi, provider);
    const isWhitelisted = await faucet.tokenWhitelist(addresses.ZYLToken);
    console.log(`ZYL whitelisted in faucet: ${isWhitelisted ? '✅ YES' : '❌ NO'}`);
    
    const faucetOwner = await faucet.owner();
    console.log(`Faucet owner: ${faucetOwner}`);
  } catch (error) {
    console.log('❌ Cannot read faucet - contract may not be deployed');
  }
}

verifyState().catch(console.error);
