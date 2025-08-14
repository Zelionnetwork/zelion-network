const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== ZYL Token Balance Verification ===\n");
  
  // Load deployment info
  const deploymentPath = path.join(__dirname, "..", "deployments", "arbitrum-sepolia-complete.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const tokenAddress = deploymentInfo.contracts.ZYLToken.address;
  
  console.log("ZYL Token Address:", tokenAddress);
  
  // Address we minted tokens to
  const targetAddress = "0x0D9DD7701bb615E0d710b5E082D05549DCbf917c";
  console.log("Target Address:", targetAddress);
  
  try {
    // Get the ZYL Token contract instance
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const zylToken = ZYLToken.attach(tokenAddress);
    
    // Check balance
    const balance = await zylToken.balanceOf(targetAddress);
    console.log("\\nOn-chain Balance:", ethers.formatEther(balance), "ZYL");
    
    // Check total supply
    const totalSupply = await zylToken.totalSupply();
    console.log("Total Supply:", ethers.formatEther(totalSupply), "ZYL");
    
    // Get token details
    const name = await zylToken.name();
    const symbol = await zylToken.symbol();
    const decimals = await zylToken.decimals();
    
    console.log("\\nToken Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Decimals:", decimals.toString());
    
    // Check if balance is correct
    if (balance > 0) {
      console.log("\\n✅ Tokens are correctly minted on-chain!");
      console.log("\\n🔍 Troubleshooting steps for frontend:");
      console.log("1. Make sure your wallet is connected to Arbitrum Sepolia network");
      console.log("2. Add the ZYL token to your wallet using this address:", tokenAddress);
      console.log("3. Ensure the connected wallet address is:", targetAddress);
      console.log("4. Refresh the frontend page");
    } else {
      console.log("\\n❌ No tokens found at the target address");
    }
    
    // Also check the deployer's balance
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await zylToken.balanceOf(deployer.address);
    console.log("\\nDeployer Balance:", ethers.formatEther(deployerBalance), "ZYL");
    console.log("Deployer Address:", deployer.address);
    
  } catch (error) {
    console.error("\\n❌ Balance check failed:");
    console.error("Error:", error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error("Balance verification failed:", error);
  process.exitCode = 1;
});
