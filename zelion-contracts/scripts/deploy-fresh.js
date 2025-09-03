const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying fresh contracts to Arbitrum Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy new ZYL Token
  console.log("Deploying ZYLToken...");
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylAddress = await zylToken.getAddress();
  console.log("✅ ZYLToken deployed to:", zylAddress);
  
  // Use existing faucet or deploy new one
  const EXISTING_FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  let faucetAddress = EXISTING_FAUCET;
  
  // Check if we should use existing faucet
  const faucetCode = await hre.ethers.provider.getCode(EXISTING_FAUCET);
  if (faucetCode === "0x") {
    console.log("\nDeploying new Faucet...");
    const Faucet = await hre.ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();
    await faucet.waitForDeployment();
    faucetAddress = await faucet.getAddress();
    console.log("✅ Faucet deployed to:", faucetAddress);
  } else {
    console.log("✅ Using existing faucet at:", EXISTING_FAUCET);
  }
  
  // Deploy SimpleSwap
  console.log("\nDeploying SimpleSwap...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  const swapAddress = await simpleSwap.getAddress();
  console.log("✅ SimpleSwap deployed to:", swapAddress);
  
  // Deploy Staking
  console.log("\nDeploying Staking...");
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(zylAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Staking deployed to:", stakingAddress);
  
  // Setup faucet
  console.log("\nSetting up faucet...");
  
  // Mint tokens to faucet
  console.log("Minting 1M ZYL to faucet...");
  const mintTx = await zylToken.mint(faucetAddress, hre.ethers.parseEther("1000000"));
  await mintTx.wait();
  console.log("✅ Minted 1,000,000 ZYL");
  
  // If using existing faucet, try to whitelist token
  if (faucetAddress === EXISTING_FAUCET) {
    try {
      const faucet = await hre.ethers.getContractAt("Faucet", faucetAddress);
      const whitelistTx = await faucet.whitelistToken(zylAddress, true);
      await whitelistTx.wait();
      console.log("✅ Token whitelisted in existing faucet");
    } catch (e) {
      console.log("⚠️ Could not whitelist token (may not be owner)");
    }
  } else {
    // Whitelist token in new faucet
    const faucet = await hre.ethers.getContractAt("Faucet", faucetAddress);
    const whitelistTx = await faucet.whitelistToken(zylAddress, true);
    await whitelistTx.wait();
    console.log("✅ Token whitelisted");
  }
  
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
  
  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, "arbitrum-sepolia-deployment.json"),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log("\n========================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("Contracts:");
  console.log("- ZYLToken:   ", zylAddress);
  console.log("- Faucet:     ", faucetAddress);
  console.log("- SimpleSwap: ", swapAddress);
  console.log("- Staking:    ", stakingAddress);
  console.log("========================================");
  
  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
