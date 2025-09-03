const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to Arbitrum Sepolia...\n");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("ETH balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  if (balance === 0n) {
    throw new Error("No ETH for gas. Get testnet ETH from: https://faucet.arbitrum.io/");
  }
  
  // Deploy ZYLToken
  console.log("1. Deploying ZYLToken...");
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylAddress = await zylToken.getAddress();
  console.log("✅ ZYLToken deployed to:", zylAddress);
  
  // Deploy Faucet
  console.log("\n2. Deploying Faucet...");
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ Faucet deployed to:", faucetAddress);
  
  // Deploy SimpleSwap
  console.log("\n3. Deploying SimpleSwap...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  const swapAddress = await simpleSwap.getAddress();
  console.log("✅ SimpleSwap deployed to:", swapAddress);
  
  // Deploy Staking
  console.log("\n4. Deploying Staking...");
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(zylAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Staking deployed to:", stakingAddress);
  
  // Setup faucet
  console.log("\n5. Setting up faucet...");
  console.log("   Minting 1M ZYL to faucet...");
  const mintTx = await zylToken.mint(faucetAddress, hre.ethers.parseEther("1000000"));
  await mintTx.wait();
  console.log("   ✅ Minted 1,000,000 ZYL");
  
  console.log("   Whitelisting ZYL token...");
  const whitelistTx = await faucet.whitelistToken(zylAddress, true);
  await whitelistTx.wait();
  console.log("   ✅ Token whitelisted");
  
  // Save deployment info
  const deployment = {
    network: "arbitrum-sepolia",
    chainId: 421614,
    contracts: {
      ZYLToken: zylAddress,
      Faucet: faucetAddress,
      SimpleSwap: swapAddress,
      Staking: stakingAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  // Save deployment file
  fs.writeFileSync(
    path.join(deploymentsDir, "arbitrum-sepolia-deployment.json"),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log("\n========================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("\nDeployed contracts:");
  console.log("- ZYLToken:    ", zylAddress);
  console.log("- Faucet:      ", faucetAddress);
  console.log("- SimpleSwap:  ", swapAddress);
  console.log("- Staking:     ", stakingAddress);
  console.log("\n✅ Faucet has 1,000,000 ZYL");
  console.log("✅ Token is whitelisted");
  console.log("\nNOW UPDATE THE FRONTEND with these addresses!");
  console.log("========================================");
  
  return deployment;
}

main()
  .then((deployment) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
