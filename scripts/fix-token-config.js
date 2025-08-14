const hre = require("hardhat");

async function main() {
  console.log("\n========== Fixing Token Configuration ==========\n");
  
  const bridgeAddress = "0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4";
  const tokenAddress = "0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890";
  
  console.log("Bridge:", bridgeAddress);
  console.log("Token:", tokenAddress);
  
  // Get the bridge contract
  const bridge = await hre.ethers.getContractAt("ZelionBridge", bridgeAddress);
  
  // Configure the token
  console.log("\nConfiguring token...");
  try {
    const tx = await bridge.configureToken(
      tokenAddress,
      true, // isSupported
      true, // isBurnable
      tokenAddress, // destinationToken (same for now)
      "3478487238524512106" // Arbitrum Sepolia chain selector
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Token configured in block:", receipt.blockNumber);
    
  } catch (error) {
    if (error.message.includes("Already configured")) {
      console.log("✅ Token already configured");
    } else {
      console.log("❌ Error:", error.message);
      return;
    }
  }
  
  // Verify configuration
  console.log("\nVerifying configuration...");
  const config = await bridge.tokenConfigs(tokenAddress);
  console.log("isSupported:", config.isSupported);
  console.log("isBurnable:", config.isBurnable);
  
  // Test fee estimation
  console.log("\nTesting fee estimation...");
  try {
    const fee = await bridge.estimateBridgeFee(
      "16281711391670634445", // Avalanche Fuji
      tokenAddress,
      hre.ethers.utils.parseEther("1")
    );
    console.log("✅ Fee estimation works!");
    console.log("Fee:", hre.ethers.utils.formatEther(fee), "ETH");
  } catch (error) {
    console.log("❌ Fee estimation error:", error.message);
  }
  
  console.log("\n========== Complete ==========\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
