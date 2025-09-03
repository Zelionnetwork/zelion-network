const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to Arbitrum Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy ZYLToken
  console.log("\n1. Deploying ZYLToken...");
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylTokenAddress = await zylToken.getAddress();
  console.log("✅ ZYLToken deployed to:", zylTokenAddress);
  
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
  const simpleSwapAddress = await simpleSwap.getAddress();
  console.log("✅ SimpleSwap deployed to:", simpleSwapAddress);
  
  // Deploy Staking
  console.log("\n4. Deploying Staking...");
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(zylTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Staking deployed to:", stakingAddress);
  
  // Configure contracts
  console.log("\n5. Configuring contracts...");
  
  // Whitelist ZYL token in faucet
  await faucet.whitelistToken(zylTokenAddress, true);
  console.log("✅ ZYL token whitelisted in faucet");
  
  // Send some ETH to faucet for distribution
  const fundTx = await deployer.sendTransaction({
    to: faucetAddress,
    value: hre.ethers.parseEther("1.0")
  });
  await fundTx.wait();
  console.log("✅ Faucet funded with 1 ETH");
  
  // Transfer ownership to NEW_OWNER_ADDRESS if set
  const NEW_OWNER = process.env.NEW_OWNER_ADDRESS;
  if (NEW_OWNER && NEW_OWNER !== "0x0000000000000000000000000000000000000000") {
    console.log("\n6. Transferring ownership to:", NEW_OWNER);
    
    await zylToken.transferOwnership(NEW_OWNER);
    console.log("✅ ZYLToken ownership transferred");
    
    await faucet.transferOwnership(NEW_OWNER);
    console.log("✅ Faucet ownership transferred");
    
    await simpleSwap.transferOwnership(NEW_OWNER);
    console.log("✅ SimpleSwap ownership transferred");
    
    await staking.transferOwnership(NEW_OWNER);
    console.log("✅ Staking ownership transferred");
  }
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      ZYLToken: zylTokenAddress,
      Faucet: faucetAddress,
      SimpleSwap: simpleSwapAddress,
      Staking: stakingAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const filename = `${hre.network.name}-deployment.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("Network:", hre.network.name);
  console.log("Contracts:");
  console.log("  ZYLToken:", zylTokenAddress);
  console.log("  Faucet:", faucetAddress);
  console.log("  SimpleSwap:", simpleSwapAddress);
  console.log("  Staking:", stakingAddress);
  console.log("========================================");
  console.log(`Deployment info saved to deployments/${filename}`);
  
  // Export ABIs for frontend
  console.log("\nExporting ABIs for frontend...");
  await exportABIs();
}

async function exportABIs() {
  const contracts = ["ZYLToken", "Faucet", "SimpleSwap", "Staking"];
  const abiDir = path.join(__dirname, "../../zelion-site/src/contracts");
  
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }
  
  for (const contractName of contracts) {
    const artifact = await hre.artifacts.readArtifact(contractName);
    const abiPath = path.join(abiDir, `${contractName}.json`);
    
    fs.writeFileSync(
      abiPath,
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
    
    console.log(`✅ ${contractName} ABI exported`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
