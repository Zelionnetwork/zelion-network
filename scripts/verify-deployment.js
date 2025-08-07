// Script to verify deployment on all networks
const { ethers, upgrades } = require("hardhat");

async function verifyNetworkDeployment(networkName, tokenAddress, bridgeAddress) {
  console.log(`\n=== Verifying deployment on ${networkName} ===`);
  
  try {
    // Verify token contract
    const token = await ethers.getContractAt("ZYLToken", tokenAddress);
    const tokenName = await token.name();
    const tokenSymbol = await token.symbol();
    const tokenSupply = await token.totalSupply();
    
    console.log(`Token Name: ${tokenName}`);
    console.log(`Token Symbol: ${tokenSymbol}`);
    console.log(`Token Supply: ${ethers.utils.formatEther(tokenSupply)}`);
    
    // Verify bridge contract
    const bridge = await ethers.getContractAt("Bridge", bridgeAddress);
    const router = await bridge.getRouter();
    
    console.log(`Bridge Router: ${router}`);
    console.log(`Bridge deployed successfully on ${networkName}`);
    
    return true;
  } catch (error) {
    console.error(`Error verifying deployment on ${networkName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("Verifying deployments across all networks...");
  
  // Load deployment files
  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = "./deployments";
  let successCount = 0;
  let totalCount = 0;
  
  if (!fs.existsSync(deploymentsDir)) {
    console.log("No deployments directory found");
    return;
  }
  
  const files = fs.readdirSync(deploymentsDir);
  
  for (const file of files) {
    if (path.extname(file) === ".json") {
      totalCount++;
      const networkName = path.basename(file, ".json");
      const deploymentData = JSON.parse(fs.readFileSync(path.join(deploymentsDir, file), "utf8"));
      
      const success = await verifyNetworkDeployment(
        networkName,
        deploymentData.token.address,
        deploymentData.bridge.address
      );
      
      if (success) {
        successCount++;
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Successfully verified: ${successCount}/${totalCount} networks`);
  
  if (successCount === totalCount) {
    console.log("All deployments verified successfully!");
  } else {
    console.log("Some deployments failed verification.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
