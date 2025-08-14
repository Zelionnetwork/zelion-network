const hre = require("hardhat");

async function main() {
  try {
    const bridge = await hre.ethers.getContractAt(
      "ZelionBridge", 
      "0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4"
    );
    
    const token = "0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890";
    
    // Check config
    const config = await bridge.tokenConfigs(token);
    console.log("Token supported:", config.isSupported);
    console.log("Token burnable:", config.isBurnable);
    
    if (!config.isSupported) {
      console.log("Configuring token...");
      const tx = await bridge.configureToken(
        token,
        true,
        true,
        token,
        "3478487238524512106"
      );
      await tx.wait();
      console.log("Token configured!");
    }
    
    // Test fee estimation with ethers v6 syntax
    console.log("\nTesting fee estimation...");
    const amount = hre.ethers.parseEther("1"); // v6 syntax
    const fee = await bridge.estimateBridgeFee(
      "16281711391670634445", // Avalanche Fuji
      token,
      amount
    );
    console.log("✅ Fee estimation works!");
    console.log("Fee amount:", hre.ethers.formatEther(fee), "ETH");
    
    // Also test with Polygon Amoy
    console.log("\nTesting with Polygon Amoy...");
    const fee2 = await bridge.estimateBridgeFee(
      "16281711391670634445", // Polygon Amoy
      token,
      amount
    );
    console.log("✅ Polygon Amoy fee:", hre.ethers.formatEther(fee2), "ETH");
    
  } catch (e) {
    console.log("❌ Error:", e.message);
    if (e.reason) console.log("Reason:", e.reason);
    if (e.data) console.log("Data:", e.data);
  }
}

main().catch(console.error);
