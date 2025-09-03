const { ethers } = require('ethers');

async function testContracts() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  console.log('Testing contract addresses on Arbitrum Sepolia...\n');
  
  // Known working faucet
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Test if these contracts exist
  const testAddresses = {
    'Current ZYL (not working)': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    'Faucet (confirmed)': '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    'SimpleSwap': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 
    'Staking': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    // Try alternative addresses
    'Alternative 1': '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    'Alternative 2': '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    'Alternative 3': '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  };
  
  console.log('Checking which contracts are deployed:');
  const deployed = {};
  
  for (const [name, addr] of Object.entries(testAddresses)) {
    const code = await provider.getCode(addr);
    const isDeployed = code !== '0x';
    console.log(`${name}: ${isDeployed ? '✅' : '❌'} ${addr}`);
    if (isDeployed) {
      deployed[addr] = name;
    }
  }
  
  // For deployed contracts, check if any are ZYL token
  console.log('\nChecking deployed contracts for ZYL token...');
  const tokenAbi = [
    'function symbol() view returns (string)',
    'function balanceOf(address) view returns (uint256)'
  ];
  
  let zylAddress = null;
  
  for (const addr of Object.keys(deployed)) {
    if (addr === FAUCET) continue; // Skip faucet
    
    try {
      const contract = new ethers.Contract(addr, tokenAbi, provider);
      const symbol = await contract.symbol();
      const faucetBalance = await contract.balanceOf(FAUCET);
      
      console.log(`${addr}: Symbol=${symbol}, Faucet balance=${ethers.formatEther(faucetBalance)}`);
      
      if (symbol === 'ZYL' && parseFloat(ethers.formatEther(faucetBalance)) > 0) {
        zylAddress = addr;
        console.log(`✅ FOUND ZYL TOKEN!`);
      }
    } catch (e) {
      // Not an ERC20 token
    }
  }
  
  if (zylAddress) {
    console.log(`\n✅ ZYL Token found at: ${zylAddress}`);
    console.log('Update the frontend with this address!');
  } else {
    console.log('\n❌ Could not find ZYL token address');
    console.log('The actual ZYL token address needs to be identified');
  }
  
  return zylAddress;
}

testContracts().catch(console.error);
