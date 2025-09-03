const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Contract ABIs and bytecodes
const ZYLToken = require('./artifacts/contracts/ZYLToken.sol/ZYLToken.json');
const Faucet = require('./artifacts/contracts/Faucet.sol/Faucet.json');
const SimpleSwap = require('./artifacts/contracts/SimpleSwap.sol/SimpleSwap.json');
const Staking = require('./artifacts/contracts/Staking.sol/Staking.json');

async function deploy() {
  console.log("🚀 Starting deployment to Arbitrum Sepolia...\n");
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📍 Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance. Need at least 0.01 ETH for deployment");
    return;
  }
  
  const deployedContracts = {};
  
  try {
    // Deploy ZYLToken
    console.log("1️⃣ Deploying ZYLToken...");
    const zylFactory = new ethers.ContractFactory(ZYLToken.abi, ZYLToken.bytecode, wallet);
    const zylToken = await zylFactory.deploy();
    await zylToken.waitForDeployment();
    deployedContracts.ZYLToken = await zylToken.getAddress();
    console.log("   ✅ ZYLToken deployed to:", deployedContracts.ZYLToken);
    
    // Deploy Faucet
    console.log("\n2️⃣ Deploying Faucet...");
    const faucetFactory = new ethers.ContractFactory(Faucet.abi, Faucet.bytecode, wallet);
    const faucet = await faucetFactory.deploy();
    await faucet.waitForDeployment();
    deployedContracts.Faucet = await faucet.getAddress();
    console.log("   ✅ Faucet deployed to:", deployedContracts.Faucet);
    
    // Deploy SimpleSwap
    console.log("\n3️⃣ Deploying SimpleSwap...");
    const swapFactory = new ethers.ContractFactory(SimpleSwap.abi, SimpleSwap.bytecode, wallet);
    const simpleSwap = await swapFactory.deploy();
    await simpleSwap.waitForDeployment();
    deployedContracts.SimpleSwap = await simpleSwap.getAddress();
    console.log("   ✅ SimpleSwap deployed to:", deployedContracts.SimpleSwap);
    
    // Deploy Staking
    console.log("\n4️⃣ Deploying Staking...");
    const stakingFactory = new ethers.ContractFactory(Staking.abi, Staking.bytecode, wallet);
    const staking = await stakingFactory.deploy(deployedContracts.ZYLToken);
    await staking.waitForDeployment();
    deployedContracts.Staking = await staking.getAddress();
    console.log("   ✅ Staking deployed to:", deployedContracts.Staking);
    
    // Configure Faucet
    console.log("\n5️⃣ Configuring Faucet...");
    
    // Whitelist ZYL token
    console.log("   - Whitelisting ZYL token...");
    const whitelistTx = await faucet.whitelistToken(deployedContracts.ZYLToken, true);
    await whitelistTx.wait();
    console.log("   ✅ ZYL token whitelisted");
    
    // Mint tokens to faucet
    console.log("   - Minting tokens to faucet...");
    const mintAmount = ethers.parseEther("1000000"); // 1M tokens
    const mintTx = await zylToken.mint(deployedContracts.Faucet, mintAmount);
    await mintTx.wait();
    console.log("   ✅ Minted 1,000,000 ZYL to faucet");
    
    // Save deployment
    const deployment = {
      network: "arbitrum-sepolia",
      chainId: 421614,
      contracts: deployedContracts,
      deployer: wallet.address,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      './deployments/arbitrum-sepolia-deployment.json',
      JSON.stringify(deployment, null, 2)
    );
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📝 Contract Addresses:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    console.log("\n✅ Faucet configured and funded with 1,000,000 ZYL");
    console.log("📁 Deployment saved to: deployments/arbitrum-sepolia-deployment.json");
    
    return deployment;
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    throw error;
  }
}

deploy().catch(console.error);
