const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Updating Frontend ABIs ===\n");
  
  // Load deployment info to get contract addresses
  const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrum-sepolia-complete.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const bridgeAddress = deploymentInfo.contracts.ZelionBridge.address;
  const tokenAddress = deploymentInfo.contracts.ZYLToken.address;
  
  console.log("ZelionBridge Address:", bridgeAddress);
  console.log("ZYLToken Address:", tokenAddress);
  
  try {
    // Get fresh contract factories with complete ABIs
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    
    // Create complete deployment info with fresh ABIs
    const frontendInfo = {
      network: "arbitrum-sepolia",
      chainId: 421614,
      ZYLToken: {
        address: tokenAddress,
        abi: JSON.parse(ZYLToken.interface.formatJson())
      },
      ZelionBridge: {
        address: bridgeAddress,
        abi: JSON.parse(ZelionBridge.interface.formatJson())
      }
    };
    
    // Save to multiple locations to ensure frontend picks it up
    const locations = [
      path.join(__dirname, "..", "..", "zelion-client", "src", "contracts", "deployment-info.json"),
      path.join(__dirname, "..", "..", "zelion-site", "src", "contracts", "deployment-info.json"),
      path.join(__dirname, "..", "..", "zelion-site", "public", "contracts", "deployment-info.json")
    ];
    
    for (const location of locations) {
      const dir = path.dirname(location);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(location, JSON.stringify(frontendInfo, null, 2));
      console.log("✅ Updated:", location);
    }
    
    // Also create a simple token addresses config
    const tokenConfig = {
      arbitrumSepolia: {
        ZYL: tokenAddress,
        Bridge: bridgeAddress
      }
    };
    
    const tokenConfigPath = path.join(__dirname, "..", "..", "zelion-site", "src", "app", "config", "tokenAddresses.js");
    const tokenConfigContent = `export const tokenAddresses = ${JSON.stringify(tokenConfig, null, 2)};`;
    
    if (!fs.existsSync(path.dirname(tokenConfigPath))) {
      fs.mkdirSync(path.dirname(tokenConfigPath), { recursive: true });
    }
    
    fs.writeFileSync(tokenConfigPath, tokenConfigContent);
    console.log("✅ Updated token config:", tokenConfigPath);
    
    // Verify the ABIs contain the required functions
    const bridgeABI = JSON.parse(ZelionBridge.interface.formatJson());
    const hasEstimateFee = bridgeABI.some(item => item.name === 'estimateBridgeFee');
    const hasCcipSend = bridgeABI.some(item => item.name === 'ccipSend');
    const hasBridgeTokens = bridgeABI.some(item => item.name === 'bridgeTokens');
    
    console.log("\\n🔍 ABI Verification:");
    console.log("  estimateBridgeFee:", hasEstimateFee ? "✅" : "❌");
    console.log("  ccipSend:", hasCcipSend ? "✅" : "❌");
    console.log("  bridgeTokens:", hasBridgeTokens ? "✅" : "❌");
    
    if (!hasEstimateFee || !hasBridgeTokens) {
      console.warn("⚠️  Some expected functions are missing from the ABI");
    }
    
    console.log("\\n🎉 Frontend ABIs updated successfully!");
    console.log("Please restart the frontend server to pick up the new ABIs.");
    
  } catch (error) {
    console.error("\\n❌ ABI update failed:");
    console.error("Error:", error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error("ABI update script failed:", error);
  process.exitCode = 1;
});
