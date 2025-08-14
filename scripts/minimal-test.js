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
    
    // Test fee
    const fee = await bridge.estimateBridgeFee(
      "16281711391670634445",
      token,
      hre.ethers.utils.parseEther("1")
    );
    console.log("Fee works! Amount:", hre.ethers.utils.formatEther(fee));
    
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main().catch(console.error);
