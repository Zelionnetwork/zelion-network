const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Import contract artifacts
const ZYLToken = require('./artifacts/contracts/ZYLToken.sol/ZYLToken.json');
const Faucet = require('./artifacts/contracts/Faucet.sol/Faucet.json');
const SimpleSwap = require('./artifacts/contracts/SimpleSwap.sol/SimpleSwap.json');
const Staking = require('./artifacts/contracts/Staking.sol/Staking.json');

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('ZELION NETWORK - CONTRACT DEPLOYMENT');
    console.log('='.repeat(60));
    
    // Check environment
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
      console.error('\n❌ ERROR: Private key not configured in .env file');
      console.error('Please add your wallet private key to the .env file');
      process.exit(1);
    }
    
    // Setup provider and wallet
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
    console.log('\n📡 Connecting to Arbitrum Sepolia...');
    console.log('   RPC URL:', rpcUrl);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Verify connection
    const network = await provider.getNetwork();
    console.log('   Network:', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    
    console.log('\n👛 Deployer wallet:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('   Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.005')) {
      console.error('\n❌ Insufficient balance! Need at least 0.005 ETH');
      process.exit(1);
    }
    
    const contracts = {};
    
    // 1. Deploy ZYLToken
    console.log('\n' + '-'.repeat(60));
    console.log('📦 [1/4] Deploying ZYLToken...');
    const zylFactory = new ethers.ContractFactory(ZYLToken.abi, ZYLToken.bytecode, wallet);
    const zylToken = await zylFactory.deploy();
    console.log('   Transaction hash:', zylToken.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    await zylToken.waitForDeployment();
    contracts.ZYLToken = await zylToken.getAddress();
    console.log('   ✅ Deployed at:', contracts.ZYLToken);
    
    // 2. Deploy Faucet
    console.log('\n📦 [2/4] Deploying Faucet...');
    const faucetFactory = new ethers.ContractFactory(Faucet.abi, Faucet.bytecode, wallet);
    const faucet = await faucetFactory.deploy();
    console.log('   Transaction hash:', faucet.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    await faucet.waitForDeployment();
    contracts.Faucet = await faucet.getAddress();
    console.log('   ✅ Deployed at:', contracts.Faucet);
    
    // 3. Deploy SimpleSwap
    console.log('\n📦 [3/4] Deploying SimpleSwap...');
    const swapFactory = new ethers.ContractFactory(SimpleSwap.abi, SimpleSwap.bytecode, wallet);
    const swap = await swapFactory.deploy();
    console.log('   Transaction hash:', swap.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    await swap.waitForDeployment();
    contracts.SimpleSwap = await swap.getAddress();
    console.log('   ✅ Deployed at:', contracts.SimpleSwap);
    
    // 4. Deploy Staking
    console.log('\n📦 [4/4] Deploying Staking...');
    const stakingFactory = new ethers.ContractFactory(Staking.abi, Staking.bytecode, wallet);
    const staking = await stakingFactory.deploy(contracts.ZYLToken);
    console.log('   Transaction hash:', staking.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    await staking.waitForDeployment();
    contracts.Staking = await staking.getAddress();
    console.log('   ✅ Deployed at:', contracts.Staking);
    
    // Configure contracts
    console.log('\n' + '-'.repeat(60));
    console.log('⚙️  Configuring contracts...\n');
    
    // Whitelist token in faucet
    console.log('   [1/3] Whitelisting ZYL token in faucet...');
    const whitelistTx = await faucet.whitelistToken(contracts.ZYLToken, true);
    console.log('   Transaction:', whitelistTx.hash);
    await whitelistTx.wait();
    console.log('   ✅ Token whitelisted');
    
    // Mint tokens to faucet
    console.log('\n   [2/3] Minting tokens to faucet...');
    const mintAmount = ethers.parseEther('1000000'); // 1M tokens
    const mintTx = await zylToken.mint(contracts.Faucet, mintAmount);
    console.log('   Transaction:', mintTx.hash);
    await mintTx.wait();
    console.log('   ✅ Minted 1,000,000 ZYL to faucet');
    
    // Set faucet parameters
    console.log('\n   [3/3] Setting faucet parameters...');
    const setAmountTx = await faucet.setTokenAmount(contracts.ZYLToken, ethers.parseEther('100'));
    console.log('   Transaction:', setAmountTx.hash);
    await setAmountTx.wait();
    console.log('   ✅ Set faucet amount to 100 ZYL per request');
    
    // Save deployment
    const deployment = {
      network: 'arbitrum-sepolia',
      chainId: 421614,
      contracts: contracts,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      configuration: {
        faucetAmount: '100 ZYL',
        faucetCooldown: '24 hours',
        faucetBalance: '1,000,000 ZYL'
      }
    };
    
    fs.writeFileSync(
      './deployments/arbitrum-sepolia-deployment.json',
      JSON.stringify(deployment, null, 2)
    );
    
    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log('\n📋 Contract Addresses:');
    console.log('   ZYLToken:   ', contracts.ZYLToken);
    console.log('   Faucet:     ', contracts.Faucet);
    console.log('   SimpleSwap: ', contracts.SimpleSwap);
    console.log('   Staking:    ', contracts.Staking);
    console.log('\n✅ Faucet Configuration:');
    console.log('   - Token whitelisted: ZYL');
    console.log('   - Balance: 1,000,000 ZYL');
    console.log('   - Amount per request: 100 ZYL');
    console.log('   - Cooldown: 24 hours');
    console.log('\n📁 Deployment saved to:');
    console.log('   deployments/arbitrum-sepolia-deployment.json');
    console.log('\n🌐 View on Arbiscan:');
    console.log('   https://sepolia.arbiscan.io/address/' + contracts.Faucet);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:');
    console.error('   Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    if (error.code) console.error('   Code:', error.code);
    if (error.transaction) {
      console.error('   Failed transaction:', error.transaction);
    }
    process.exit(1);
  }
}

// Run deployment
main().then(() => {
  console.log('\n✨ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
