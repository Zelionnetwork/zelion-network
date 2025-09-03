const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to Arbitrum Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy ZYLToken
  console.log("\n1. Deploying ZYLToken...");
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylAddress = await zylToken.getAddress();
  console.log("ZYLToken deployed to:", zylAddress);
  
  // Deploy Faucet
  console.log("\n2. Deploying Faucet...");
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed to:", faucetAddress);
  
  // Deploy SimpleSwap
  console.log("\n3. Deploying SimpleSwap...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  const swapAddress = await simpleSwap.getAddress();
  console.log("SimpleSwap deployed to:", swapAddress);
  
  // Deploy Staking
  console.log("\n4. Deploying Staking...");
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(zylAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking deployed to:", stakingAddress);
  
  // Configure contracts
  console.log("\n5. Configuring contracts...");
  
  // Whitelist ZYL token in faucet
  console.log("Whitelisting ZYL token in faucet...");
  const whitelistTx = await faucet.whitelistToken(zylAddress, true);
  await whitelistTx.wait();
  console.log("ZYL token whitelisted");
  
  // Transfer some ZYL to faucet for distribution
  console.log("Transferring ZYL to faucet...");
  const transferAmount = hre.ethers.parseUnits("100000", 18);
  const transferTx = await zylToken.transfer(faucetAddress, transferAmount);
  await transferTx.wait();
  console.log("Transferred 100,000 ZYL to faucet");
  
  // Fund faucet with ETH
  console.log("Funding faucet with ETH...");
  const fundTx = await deployer.sendTransaction({
    to: faucetAddress,
    value: hre.ethers.parseEther("0.1")
  });
  await fundTx.wait();
  console.log("Funded faucet with 0.1 ETH");
  
  // Save deployment info
  const deploymentInfo = {
    network: "arbitrumSepolia",
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
  
  const deploymentPath = path.join(__dirname, "../deployments/arbitrum-sepolia-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to:", deploymentPath);
  
  console.log("\n✅ Deployment complete!");
  console.log("Contract addresses:");
  console.log("- ZYLToken:", zylAddress);
  console.log("- Faucet:", faucetAddress);
  console.log("- SimpleSwap:", swapAddress);
  console.log("- Staking:", stakingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
