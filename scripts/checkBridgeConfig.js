const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking bridge contract configuration...");

  const BRIDGE_ADDRESS = "0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Bridge contract ABI
  const bridgeAbi = [
    "function router() external view returns (address)",
    "function token() external view returns (address)",
    "function destinationChainSelector() external view returns (uint64)",
    "function owner() external view returns (address)",
    "function isPaused() external view returns (bool)"
  ];

  // Connect to bridge contract
  const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, signer);

  try {
    console.log("\n📋 Bridge Contract Configuration:");
    console.log("Contract Address:", BRIDGE_ADDRESS);
    
    const router = await bridgeContract.router();
    console.log("Router Address:", router);
    
    const token = await bridgeContract.token();
    console.log("Configured Token:", token);
    
    const selector = await bridgeContract.destinationChainSelector();
    console.log("Destination Chain Selector:", selector.toString());
    
    const owner = await bridgeContract.owner();
    console.log("Owner:", owner);
    
    const isPaused = await bridgeContract.isPaused();
    console.log("Is Paused:", isPaused);

    // Check which token this is
    console.log("\n🔍 Token Analysis:");
    if (token.toLowerCase() === "0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890".toLowerCase()) {
      console.log("✅ Configured for ZYL token");
      console.log("💡 This bridge only works with ZYL tokens");
    } else if (token.toLowerCase() === "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D".toLowerCase()) {
      console.log("✅ Configured for CCIP-BnM token");
      console.log("💡 This bridge only works with CCIP-BnM tokens");
    } else {
      console.log("❓ Unknown token configuration");
    }

    console.log("\n🎯 Recommendation:");
    console.log("Since this is a single-token bridge, you need to:");
    console.log("1. Use only the configured token for bridging");
    console.log("2. OR deploy a new multi-token bridge contract");

  } catch (error) {
    console.error("❌ Error checking bridge config:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
