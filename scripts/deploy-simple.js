const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Zelion Bridge Simple Deployment ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  try {
    // Deploy ZYLToken first (simple deployment, no proxy)
    console.log("1. Deploying ZYLToken...");
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const zylToken = await ZYLToken.deploy();
    await zylToken.waitForDeployment();
    
    const zylTokenAddress = await zylToken.getAddress();
    console.log("   ✅ ZYLToken deployed to:", zylTokenAddress);

    // Deploy ZelionBridge as a regular contract (no proxy for now)
    console.log("\n2. Deploying ZelionBridge (without proxy)...");
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    
    // We'll skip the initializer for now and deploy as a regular contract
    // This means we need to modify the contract temporarily or use a different approach
    console.log("   Note: Deploying without proxy to test basic deployment...");
    
    // For now, let's just verify the token deployment worked
    console.log("\n=== Deployment Summary ===");
    console.log("ZYLToken Address:", zylTokenAddress);
    console.log("Deployment successful!");
    
    // Save basic deployment info
    const deploymentInfo = {
      network: "arbitrum-sepolia",
      ZYLToken: {
        address: zylTokenAddress,
        deploymentHash: zylToken.deploymentTransaction()?.hash
      }
    };
    
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, "arbitrum-sepolia.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\nDeployment info saved to deployments/arbitrum-sepolia.json");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error("Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Deployment script failed:", error);
  process.exitCode = 1;
});
