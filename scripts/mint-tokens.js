const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== ZYL Token Minting Script ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Minting tokens with account:", deployer.address);
  
  // Load deployment info to get contract address
  const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrum-sepolia-complete.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please deploy contracts first.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const zylTokenAddress = deploymentInfo.contracts.ZYLToken.address;
  
  console.log("ZYL Token Address:", zylTokenAddress);
  
  // Target address and amount
  const targetAddress = "0x0D9DD7701bb615E0d710b5E082D05549DCbf917c";
  const mintAmount = ethers.parseEther("3000"); // 3000 ZYL tokens (18 decimals)
  
  console.log("Target Address:", targetAddress);
  console.log("Amount to Mint:", ethers.formatEther(mintAmount), "ZYL");
  
  try {
    // Get the ZYL Token contract instance
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const zylToken = ZYLToken.attach(zylTokenAddress);
    
    // Check current balance before minting
    const balanceBefore = await zylToken.balanceOf(targetAddress);
    console.log("\\nBalance before minting:", ethers.formatEther(balanceBefore), "ZYL");
    
    // Check if deployer has BRIDGE_ROLE (required for minting)
    const BRIDGE_ROLE = await zylToken.BRIDGE_ROLE();
    const hasBridgeRole = await zylToken.hasRole(BRIDGE_ROLE, deployer.address);
    
    if (!hasBridgeRole) {
      console.error("❌ Deployer does not have BRIDGE_ROLE. Cannot mint tokens.");
      process.exit(1);
    }
    
    console.log("✅ Deployer has BRIDGE_ROLE. Proceeding with minting...");
    
    // Mint tokens
    console.log("\\nMinting tokens...");
    const mintTx = await zylToken.mint(targetAddress, mintAmount);
    console.log("Transaction hash:", mintTx.hash);
    
    // Wait for transaction confirmation
    const receipt = await mintTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Check balance after minting
    const balanceAfter = await zylToken.balanceOf(targetAddress);
    console.log("\\nBalance after minting:", ethers.formatEther(balanceAfter), "ZYL");
    
    // Check total supply
    const totalSupply = await zylToken.totalSupply();
    console.log("Total Supply:", ethers.formatEther(totalSupply), "ZYL");
    
    console.log("\\n🎉 Successfully minted", ethers.formatEther(mintAmount), "ZYL tokens to", targetAddress);
    
  } catch (error) {
    console.error("\\n❌ Minting failed:");
    console.error("Error:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Minting script failed:", error);
  process.exitCode = 1;
});
