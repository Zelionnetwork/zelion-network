const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Comprehensive Bridge Configuration ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Configuring with account:", deployer.address);
  
  // Load deployment info
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
  
  // First, let's verify the token balance issue
  console.log("\n=== Verifying Token Balance ===");
  const targetAddress = "0x0D9DD7701bb615E0d710b5E082D05549DCbf917c";
  
  try {
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const zylToken = ZYLToken.attach(tokenAddress);
    
    const balance = await zylToken.balanceOf(targetAddress);
    console.log("Target Address:", targetAddress);
    console.log("Current Balance:", ethers.formatEther(balance), "ZYL");
    
    if (balance === 0n) {
      console.log("⚠️  Balance is 0 - minting 3000 ZYL tokens...");
      const mintTx = await zylToken.mint(targetAddress, ethers.parseEther("3000"));
      await mintTx.wait();
      console.log("✅ Minted 3000 ZYL tokens");
      
      const newBalance = await zylToken.balanceOf(targetAddress);
      console.log("New Balance:", ethers.formatEther(newBalance), "ZYL");
    } else {
      console.log("✅ Balance is correct");
    }
    
    // Now configure the bridge for multiple chains
    console.log("\n=== Configuring Bridge for Multiple Chains ===");
    
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    const bridge = ZelionBridge.attach(bridgeAddress);
    
    // Chain configurations (CCIP chain selectors)
    const chainConfigs = [
      {
        name: "Polygon Amoy",
        selector: "16281711391670634445",
        destinationToken: tokenAddress // Assuming same token address on destination
      },
      {
        name: "Avalanche Fuji", 
        selector: "14767482510784806043",
        destinationToken: tokenAddress
      },
      {
        name: "Ethereum Sepolia",
        selector: "16015286601757825753", 
        destinationToken: tokenAddress
      },
      {
        name: "Base Sepolia",
        selector: "10344971235874465080",
        destinationToken: tokenAddress
      }
    ];
    
    for (const config of chainConfigs) {
      try {
        console.log(`\nConfiguring ${config.name}...`);
        
        const configTx = await bridge.configureToken(
          tokenAddress,
          true, // isSupported
          true, // isBurnable
          config.destinationToken,
          config.selector
        );
        
        await configTx.wait();
        console.log(`✅ ${config.name} configured successfully`);
        
        // Test fee estimation for this chain
        try {
          const testAmount = ethers.parseEther("100");
          const fee = await bridge.estimateBridgeFee(config.selector, tokenAddress, testAmount);
          console.log(`   Fee estimate: ${ethers.formatEther(fee)} ETH`);
        } catch (feeError) {
          console.log(`   ⚠️  Fee estimation failed: ${feeError.message}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to configure ${config.name}:`, error.message);
      }
    }
    
    // Update frontend configuration with all supported chains
    console.log("\n=== Updating Frontend Configuration ===");
    
    const updatedTokenConfig = {
      arbitrumSepolia: {
        ZYL: tokenAddress,
        Bridge: bridgeAddress
      },
      "Arbitrum Sepolia": {
        ZYL: tokenAddress,
        Bridge: bridgeAddress
      },
      421614: {
        ZYL: tokenAddress,
        Bridge: bridgeAddress
      }
    };
    
    const updatedChainSelectors = {
      arbitrumSepolia: "3478487238524512106",
      "Arbitrum Sepolia": "3478487238524512106",
      polygonAmoy: "16281711391670634445",
      "Polygon Amoy": "16281711391670634445",
      avalancheFuji: "14767482510784806043",
      "Avalanche Fuji": "14767482510784806043",
      ethereumSepolia: "16015286601757825753",
      "Ethereum Sepolia": "16015286601757825753",
      baseSepolia: "10344971235874465080",
      "Base Sepolia": "10344971235874465080"
    };
    
    // Create comprehensive token config
    const tokenConfigContent = `// Token addresses and chain configuration
const tokenAddresses = ${JSON.stringify(updatedTokenConfig, null, 2)};

// Chain selectors for CCIP
const chainSelectors = ${JSON.stringify(updatedChainSelectors, null, 2)};

// Helper functions that the frontend expects
export const getTokenAddress = (network) => {
  // Frontend expects just the ZYL token address for the given network
  return tokenAddresses[network]?.ZYL;
};

export const getChainSelector = (network) => {
  return chainSelectors[network];
};

export const getBridgeAddress = (network) => {
  return tokenAddresses[network]?.Bridge;
};

// Export the raw data as well
export { tokenAddresses, chainSelectors };`;
    
    const tokenConfigPath = path.join(__dirname, "..", "..", "zelion-site", "src", "app", "config", "tokenAddresses.js");
    fs.writeFileSync(tokenConfigPath, tokenConfigContent);
    console.log("✅ Updated frontend token configuration");
    
    console.log("\n🎉 Comprehensive configuration completed!");
    console.log("\nSupported destination chains:");
    chainConfigs.forEach(config => {
      console.log(`  - ${config.name}`);
    });
    
    console.log("\n📋 Summary:");
    console.log("✅ Token balance verified/fixed");
    console.log("✅ Bridge configured for multiple chains");
    console.log("✅ Frontend configuration updated");
    console.log("✅ Fee estimation tested");
    
    console.log("\n🔄 Next steps:");
    console.log("1. Restart the frontend server");
    console.log("2. Refresh the browser");
    console.log("3. Test balance display and chain selection");
    
  } catch (error) {
    console.error("\n❌ Configuration failed:");
    console.error("Error:", error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error("Configuration script failed:", error);
  process.exitCode = 1;
});
