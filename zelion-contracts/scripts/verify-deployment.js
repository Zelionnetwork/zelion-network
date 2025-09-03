const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  console.log("Verifying contract deployment on Arbitrum Sepolia...\n");
  
  const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
  
  // Addresses from memories
  const contracts = {
    "ZYLToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "Faucet": "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0",
    "SimpleSwap": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "Staking": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  };
  
  console.log("Checking contract deployments:");
  console.log("================================");
  
  for (const [name, address] of Object.entries(contracts)) {
    const code = await provider.getCode(address);
    const exists = code !== "0x";
    console.log(`${name.padEnd(12)}: ${address} - ${exists ? "✅ DEPLOYED" : "❌ NOT FOUND"}`);
  }
  
  console.log("\n================================");
  console.log("Summary:");
  
  // Test with minimal ABI to confirm faucet functionality
  if ((await provider.getCode(contracts.Faucet)) !== "0x") {
    const faucet = new ethers.Contract(
      contracts.Faucet,
      ["function tokenWhitelist(address) view returns (bool)"],
      provider
    );
    
    try {
      // Check both possible ZYL addresses
      const addr1 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const addr2 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
      
      const whitelisted1 = await faucet.tokenWhitelist(addr1);
      const whitelisted2 = await faucet.tokenWhitelist(addr2);
      
      console.log(`\nFaucet whitelist check:`);
      console.log(`${addr1}: ${whitelisted1 ? "✅ Whitelisted" : "❌ Not whitelisted"}`);
      console.log(`${addr2}: ${whitelisted2 ? "✅ Whitelisted" : "❌ Not whitelisted"}`);
    } catch (e) {
      console.log("\nCouldn't check faucet whitelist:", e.message);
    }
  }
}

main().catch(console.error);
