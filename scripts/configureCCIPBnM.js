const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Configuring CCIP-BnM support in bridge contract...");

  // Contract addresses
  const BRIDGE_ADDRESS = "0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4";
  const CCIP_BNM_ADDRESS = "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Bridge contract ABI (minimal for configuration)
  const bridgeAbi = [
    "function setTokenConfig(address token, bool isSupported, uint256 minAmount, uint256 maxAmount) external",
    "function tokenConfigs(address token) external view returns (bool isSupported, uint256 minAmount, uint256 maxAmount)",
    "function owner() external view returns (address)"
  ];

  // Connect to bridge contract
  const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, signer);

  try {
    // Check if we're the owner
    const owner = await bridgeContract.owner();
    console.log("Bridge contract owner:", owner);
    console.log("Current signer:", signer.address);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("❌ Error: You are not the owner of the bridge contract");
      console.log("Only the owner can configure token support");
      return;
    }

    // Check current CCIP-BnM configuration
    console.log("\n🔍 Checking current CCIP-BnM configuration...");
    const currentConfig = await bridgeContract.tokenConfigs(CCIP_BNM_ADDRESS);
    console.log("Current config:", {
      isSupported: currentConfig.isSupported,
      minAmount: ethers.formatEther(currentConfig.minAmount),
      maxAmount: ethers.formatEther(currentConfig.maxAmount)
    });

    if (currentConfig.isSupported) {
      console.log("✅ CCIP-BnM is already configured and supported!");
      return;
    }

    // Configure CCIP-BnM support
    console.log("\n⚙️ Configuring CCIP-BnM token support...");
    const minAmount = ethers.parseEther("0.1"); // 0.1 CCIP-BnM minimum
    const maxAmount = ethers.parseEther("10000"); // 10,000 CCIP-BnM maximum
    
    const tx = await bridgeContract.setTokenConfig(
      CCIP_BNM_ADDRESS,
      true, // isSupported = true
      minAmount,
      maxAmount
    );

    console.log("Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Verify configuration
    console.log("\n🔍 Verifying new configuration...");
    const newConfig = await bridgeContract.tokenConfigs(CCIP_BNM_ADDRESS);
    console.log("New config:", {
      isSupported: newConfig.isSupported,
      minAmount: ethers.formatEther(newConfig.minAmount),
      maxAmount: ethers.formatEther(newConfig.maxAmount)
    });

    if (newConfig.isSupported) {
      console.log("🎉 CCIP-BnM is now configured and supported!");
      console.log("💡 You can now bridge CCIP-BnM tokens successfully!");
    }

  } catch (error) {
    console.error("❌ Error configuring CCIP-BnM:", error.message);
    
    if (error.message.includes("Ownable")) {
      console.log("💡 This function requires contract owner permissions");
    } else if (error.message.includes("setTokenConfig")) {
      console.log("💡 The contract might not have a setTokenConfig function");
      console.log("Check if the bridge contract supports token configuration");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
