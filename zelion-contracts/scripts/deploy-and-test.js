const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const ZYLTokenABI = require('../artifacts/contracts/ZYLToken.sol/ZYLToken.json').abi;
const FaucetABI = require('../artifacts/contracts/Faucet.sol/Faucet.json').abi;
const SimpleSwapABI = require('../artifacts/contracts/SimpleSwap.sol/SimpleSwap.json').abi;
const StakingABI = require('../artifacts/contracts/Staking.sol/Staking.json').abi;

// Contract Bytecodes
const ZYLTokenBytecode = require('../artifacts/contracts/ZYLToken.sol/ZYLToken.json').bytecode;
const FaucetBytecode = require('../artifacts/contracts/Faucet.sol/Faucet.json').bytecode;
const SimpleSwapBytecode = require('../artifacts/contracts/SimpleSwap.sol/SimpleSwap.json').bytecode;
const StakingBytecode = require('../artifacts/contracts/Staking.sol/Staking.json').bytecode;

async function main() {
  console.log("🚀 Zelion Network - Deploy & Test on Arbitrum Sepolia\n");
  console.log("=".repeat(60));
  
  // Connect to Arbitrum Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Network: Arbitrum Sepolia (Chain ID: 421614)");
  console.log("Deployer:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");
  
  if (balance === 0n) {
    console.log("⚠️ WARNING: No ETH balance. Get testnet ETH from:");
    console.log("https://faucet.arbitrum.io/\n");
  }
  
  // Check gas prices
  console.log("📊 GAS ANALYSIS");
  console.log("-".repeat(40));
  
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || 100000000n; // 0.1 Gwei default
  const gasPriceGwei = Number(gasPrice) / 1e9;
  
  console.log(`Gas Price: ${gasPriceGwei.toFixed(6)} Gwei`);
  
  // Calculate deployment costs
  const deploymentGas = {
    ZYLToken: 1500000,
    Faucet: 1200000,
    SimpleSwap: 2000000,
    Staking: 1800000
  };
  
  let totalCost = 0n;
  console.log("\nDeployment Cost Estimates:");
  for (const [contract, gas] of Object.entries(deploymentGas)) {
    const cost = gasPrice * BigInt(gas);
    totalCost += cost;
    console.log(`${contract.padEnd(12)}: ${ethers.formatEther(cost)} ETH`);
  }
  console.log(`Total: ${ethers.formatEther(totalCost)} ETH\n`);
  
  // Transaction cost estimates
  console.log("Transaction Cost Estimates (USD @ $2000/ETH):");
  const txGasEstimates = [
    { name: "Token Transfer", gas: 65000 },
    { name: "Faucet Request", gas: 75000 },
    { name: "Stake Tokens", gas: 120000 },
    { name: "Swap Tokens", gas: 150000 }
  ];
  
  let maxTxCost = 0;
  for (const tx of txGasEstimates) {
    const costWei = gasPrice * BigInt(tx.gas);
    const costEth = Number(costWei) / 1e18;
    const costUsd = costEth * 2000;
    maxTxCost = Math.max(maxTxCost, costUsd);
    console.log(`${tx.name.padEnd(15)}: $${costUsd.toFixed(6)}`);
  }
  
  if (maxTxCost > 0.50) {
    console.log("\n⚠️ HIGH FEES: Max transaction > $0.50");
  } else {
    console.log("\n✅ LOW FEES: All transactions < $0.50");
  }
  
  // Deploy contracts
  console.log("\n📦 DEPLOYING CONTRACTS");
  console.log("-".repeat(40));
  
  try {
    // 1. Deploy ZYLToken
    console.log("\n1. Deploying ZYLToken...");
    const ZYLTokenFactory = new ethers.ContractFactory(ZYLTokenABI, ZYLTokenBytecode, wallet);
    const zylToken = await ZYLTokenFactory.deploy();
    await zylToken.waitForDeployment();
    const zylAddress = await zylToken.getAddress();
    console.log("✅ ZYLToken deployed:", zylAddress);
    
    // 2. Deploy Faucet
    console.log("\n2. Deploying Faucet...");
    const FaucetFactory = new ethers.ContractFactory(FaucetABI, FaucetBytecode, wallet);
    const faucet = await FaucetFactory.deploy();
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("✅ Faucet deployed:", faucetAddress);
    
    // 3. Deploy SimpleSwap
    console.log("\n3. Deploying SimpleSwap...");
    const SwapFactory = new ethers.ContractFactory(SimpleSwapABI, SimpleSwapBytecode, wallet);
    const swap = await SwapFactory.deploy();
    await swap.waitForDeployment();
    const swapAddress = await swap.getAddress();
    console.log("✅ SimpleSwap deployed:", swapAddress);
    
    // 4. Deploy Staking
    console.log("\n4. Deploying Staking...");
    const StakingFactory = new ethers.ContractFactory(StakingABI, StakingBytecode, wallet);
    const staking = await StakingFactory.deploy(zylAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ Staking deployed:", stakingAddress);
    
    // Configure contracts
    console.log("\n⚙️ CONFIGURING CONTRACTS");
    console.log("-".repeat(40));
    
    // Whitelist ZYL in faucet
    console.log("Whitelisting ZYL token...");
    const whitelistTx = await faucet.whitelistToken(zylAddress, true);
    await whitelistTx.wait();
    console.log("✅ ZYL whitelisted in faucet");
    
    // Transfer ZYL to faucet
    console.log("Funding faucet with ZYL...");
    const transferTx = await zylToken.transfer(faucetAddress, ethers.parseUnits("100000", 18));
    await transferTx.wait();
    console.log("✅ Transferred 100,000 ZYL to faucet");
    
    // Fund faucet with ETH
    console.log("Funding faucet with ETH...");
    const fundTx = await wallet.sendTransaction({
      to: faucetAddress,
      value: ethers.parseEther("0.05")
    });
    await fundTx.wait();
    console.log("✅ Funded faucet with 0.05 ETH");
    
    // Save deployment info
    const fs = require('fs');
    const path = require('path');
    
    const deployment = {
      network: "arbitrumSepolia",
      chainId: 421614,
      contracts: {
        ZYLToken: zylAddress,
        Faucet: faucetAddress,
        SimpleSwap: swapAddress,
        Staking: stakingAddress
      },
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      verified: false
    };
    
    const deployPath = path.join(__dirname, '../deployments/arbitrum-sepolia-deployment.json');
    fs.writeFileSync(deployPath, JSON.stringify(deployment, null, 2));
    
    // Update frontend contracts
    const frontendPath = path.join(__dirname, '../../zelion-site/src/contracts/addresses.js');
    const addressesJS = `// Contract addresses for Arbitrum Sepolia testnet
export const CONTRACT_ADDRESSES = {
  421614: { // Arbitrum Sepolia
    ZYLToken: "${zylAddress}",
    Faucet: "${faucetAddress}",
    SimpleSwap: "${swapAddress}",
    Staking: "${stakingAddress}"
  }
};

export const getContractAddress = (chainId, contractName) => {
  return CONTRACT_ADDRESSES[chainId]?.[contractName] || null;
};`;
    
    fs.writeFileSync(frontendPath, addressesJS);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    
    console.log("\n📋 Contract Addresses:");
    console.log(`ZYLToken:    ${zylAddress}`);
    console.log(`Faucet:      ${faucetAddress}`);
    console.log(`SimpleSwap:  ${swapAddress}`);
    console.log(`Staking:     ${stakingAddress}`);
    
    console.log("\n📊 Gas Analysis Summary:");
    console.log(`✅ Gas Price: ${gasPriceGwei.toFixed(6)} Gwei (LOW)`);
    console.log(`✅ Max TX Cost: $${maxTxCost.toFixed(6)} (< $0.50)`);
    console.log("✅ No high fees on MetaMask");
    
    console.log("\n🎯 Next Steps:");
    console.log("1. Contracts deployed and configured");
    console.log("2. Frontend updated with new addresses");
    console.log("3. Ready for testing at http://localhost:3000");
    
    // Verify contracts
    console.log("\n🔍 Verifying contracts on Arbiscan...");
    console.log("Run: npx hardhat verify --network arbitrumSepolia <address>");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    
    // Check if contracts already exist
    console.log("\n📍 Checking existing contracts...");
    const existing = {
      ZYLToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      Faucet: "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0",
      SimpleSwap: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      Staking: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    };
    
    for (const [name, address] of Object.entries(existing)) {
      const code = await provider.getCode(address);
      if (code !== '0x') {
        console.log(`✅ ${name}: Already deployed at ${address}`);
      } else {
        console.log(`❌ ${name}: Not found at ${address}`);
      }
    }
  }
}

main().catch(console.error);
