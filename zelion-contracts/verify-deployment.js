const { ethers } = require('ethers');

async function verifyDeployment() {
  console.log('Verifying contract deployment on Arbitrum Sepolia...\n');
  
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  const contracts = {
    ZYLToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    SimpleSwap: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  };
  
  console.log('Checking if contracts exist at expected addresses:\n');
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await provider.getCode(address);
      if (code === '0x') {
        console.log(`❌ ${name}: NOT DEPLOYED at ${address}`);
      } else {
        console.log(`✅ ${name}: DEPLOYED at ${address} (${code.length} bytes)`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR checking ${address}`);
    }
  }
  
  // Try to call balanceOf on ZYL token
  console.log('\nTesting ZYL token balanceOf function:');
  try {
    const zylToken = new ethers.Contract(
      contracts.ZYLToken,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    
    const balance = await zylToken.balanceOf(contracts.Faucet);
    console.log(`✅ Faucet ZYL balance: ${ethers.formatEther(balance)} ZYL`);
  } catch (error) {
    console.log(`❌ Failed to call balanceOf: ${error.message}`);
  }
}

verifyDeployment().catch(console.error);
