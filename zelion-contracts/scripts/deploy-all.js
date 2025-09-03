const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Arbitrum Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
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
  
  // Setup: Mint tokens to faucet
  console.log("\n5. Setting up faucet...");
  const mintTx = await zylToken.mint(faucetAddress, hre.ethers.parseEther("1000000"));
  await mintTx.wait();
  console.log("✅ Minted 1,000,000 ZYL to faucet");
  
  // Whitelist token in faucet
  const whitelistTx = await faucet.whitelistToken(zylAddress, true);
  await whitelistTx.wait();
  console.log("✅ ZYL token whitelisted in faucet");
  
  // Save deployment
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
  
  const fs = require("fs");
  fs.writeFileSync(
    "./deployments/arbitrum-sepolia-deployment.json",
    JSON.stringify(deployment, null, 2)
  );
  
  console.log("\n========================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("Contracts deployed:");
  console.log("- ZYLToken:", zylAddress);
  console.log("- Faucet:", faucetAddress);
  console.log("- SimpleSwap:", swapAddress);
  console.log("- Staking:", stakingAddress);
  console.log("\n✅ Faucet funded with 1,000,000 ZYL");
  console.log("✅ ZYL token whitelisted in faucet");
  console.log("\nDeployment saved to: deployments/arbitrum-sepolia-deployment.json");
  console.log("========================================");
  
  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
