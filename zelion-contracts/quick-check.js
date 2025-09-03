const { ethers } = require('ethers');

(async () => {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // Known addresses
  const addresses = {
    ZYLToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    SimpleSwap: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  };
  
  // Check each contract
  for (const [name, addr] of Object.entries(addresses)) {
    const code = await provider.getCode(addr);
    console.log(`${name}: ${code !== '0x' ? 'DEPLOYED' : 'NOT DEPLOYED'}`);
  }
  
  // Try to get faucet balance
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const token = new ethers.Contract(addresses.ZYLToken, abi, provider);
  
  try {
    const bal = await token.balanceOf(addresses.Faucet);
    console.log(`Faucet balance: ${ethers.formatEther(bal)} ZYL`);
  } catch (e) {
    console.log('Cannot read balance - ZYL may not be deployed at that address');
  }
})();
