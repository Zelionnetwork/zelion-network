const { ethers } = require("hardhat");

async function main() {
  console.log("=== Zelion Bridge Deployment Diagnostics ===\n");
  
  try {
    // Test 1: Check if we can get signers
    console.log("1. Testing signer access...");
    const signers = await ethers.getSigners();
    console.log(`   Found ${signers.length} signers`);
    
    if (signers.length === 0) {
      console.error("   ❌ No signers found - PRIVATE_KEY likely missing from .env");
      return;
    }
    
    const deployer = signers[0];
    console.log(`   ✅ Deployer address: ${deployer.address}`);
    
    // Test 2: Check network connection
    console.log("\n2. Testing network connection...");
    const network = await ethers.provider.getNetwork();
    console.log(`   ✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test 3: Check deployer balance
    console.log("\n3. Testing deployer balance...");
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.warn("   ⚠️  Warning: Deployer has 0 ETH balance - deployment will fail");
    } else {
      console.log("   ✅ Deployer has sufficient balance for deployment");
    }
    
    // Test 4: Try to get contract factory
    console.log("\n4. Testing contract compilation...");
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    console.log("   ✅ ZYLToken contract factory created successfully");
    
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    console.log("   ✅ ZelionBridge contract factory created successfully");
    
    console.log("\n=== All diagnostics passed! Deployment should work. ===");
    
  } catch (error) {
    console.error("\n❌ Diagnostic failed:");
    console.error("Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});
