const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Configure ZYL Token for Polygon Amoy Bridging ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Configuring with account:", deployer.address);
  
  // Load deployment info
  const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrum-sepolia-complete.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please deploy contracts first.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const bridgeAddress = deploymentInfo.contracts.ZelionBridge.address;
  const tokenAddress = deploymentInfo.contracts.ZYLToken.address;
  
  console.log("ZelionBridge Address:", bridgeAddress);
  console.log("ZYL Token Address:", tokenAddress);
  
  try {
    // Get the bridge contract instance
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    const bridge = ZelionBridge.attach(bridgeAddress);
    
    // Polygon Amoy chain selector (from the error: 80002 is the chain ID, but we need the CCIP chain selector)
    // Let me use the correct CCIP chain selector for Polygon Amoy
    const polygonAmoySelector = "16281711391670634445"; // CCIP chain selector for Polygon Amoy
    
    console.log("\\nConfiguring token for Polygon Amoy bridging...");
    console.log("Chain Selector:", polygonAmoySelector);
    
    // Configure the token for Polygon Amoy
    const configTx = await bridge.configureToken(
      tokenAddress,
      true, // isSupported
      true, // isBurnable (burn on source, mint on destination)
      tokenAddress, // destinationToken (assuming same token address on destination)
      polygonAmoySelector
    );
    
    console.log("Transaction hash:", configTx.hash);
    
    // Wait for confirmation
    const receipt = await configTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Verify the configuration
    console.log("\\nVerifying token configuration...");
    const tokenConfig = await bridge.tokenConfigs(tokenAddress);
    
    console.log("Token Configuration:");
    console.log("  - Supported:", tokenConfig.isSupported);
    console.log("  - Burnable:", tokenConfig.isBurnable);
    console.log("  - Destination Token:", tokenConfig.destinationToken);
    console.log("  - Destination Chain Selector:", tokenConfig.destinationChainSelector.toString());
    
    // Test the estimateBridgeFee function that was failing
    console.log("\\nTesting fee estimation...");
    const testAmount = ethers.parseEther("100"); // 100 tokens
    
    try {
      const estimatedFee = await bridge.estimateBridgeFee(polygonAmoySelector, tokenAddress, testAmount);
      console.log("✅ Fee estimation successful:", ethers.formatEther(estimatedFee), "ETH");
    } catch (feeError) {
      console.error("❌ Fee estimation still failing:", feeError.message);
    }
    
    console.log("\\n🎉 Successfully configured ZYL token for Polygon Amoy bridging!");
    console.log("Frontend should now be able to estimate fees and bridge tokens.");
    
  } catch (error) {
    console.error("\\n❌ Configuration failed:");
    console.error("Error:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Configuration script failed:", error);
  process.exitCode = 1;
});
