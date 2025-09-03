const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  console.log('Starting faucet mint process...\n');
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Connected to Arbitrum Sepolia');
  console.log('Wallet address:', wallet.address);
  
  // Contract addresses
  const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Minimal ABIs
  const tokenABI = [
    'function owner() view returns (address)',
    'function balanceOf(address) view returns (uint256)',
    'function mint(address to, uint256 amount) returns (bool)'
  ];
  
  const faucetABI = [
    'function tokenWhitelist(address) view returns (bool)',
    'function whitelistToken(address token, bool status)'
  ];
  
  // Create contract instances
  const zylToken = new ethers.Contract(ZYL_TOKEN, tokenABI, wallet);
  const faucet = new ethers.Contract(FAUCET, faucetABI, wallet);
  
  try {
    // Step 1: Verify ownership
    console.log('\n1. Checking token ownership...');
    const owner = await zylToken.owner();
    console.log('Token owner:', owner);
    console.log('Your address:', wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error('You are not the owner of the ZYL token contract');
    }
    console.log('✅ Ownership verified');
    
    // Step 2: Check current faucet balance
    console.log('\n2. Checking current faucet balance...');
    const currentBalance = await zylToken.balanceOf(FAUCET);
    console.log('Current balance:', ethers.formatEther(currentBalance), 'ZYL');
    
    // Step 3: Mint 1 million tokens
    console.log('\n3. Minting 1,000,000 ZYL tokens to faucet...');
    const mintAmount = ethers.parseEther('1000000');
    
    const mintTx = await zylToken.mint(FAUCET, mintAmount);
    console.log('Transaction sent:', mintTx.hash);
    console.log('Waiting for confirmation...');
    
    const mintReceipt = await mintTx.wait();
    console.log('✅ Mint confirmed in block:', mintReceipt.blockNumber);
    
    // Step 4: Verify new balance
    const newBalance = await zylToken.balanceOf(FAUCET);
    console.log('New faucet balance:', ethers.formatEther(newBalance), 'ZYL');
    
    // Step 5: Whitelist token in faucet
    console.log('\n4. Checking token whitelist status...');
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    console.log('Currently whitelisted:', isWhitelisted);
    
    if (!isWhitelisted) {
      console.log('Whitelisting ZYL token in faucet...');
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true);
      console.log('Transaction sent:', whitelistTx.hash);
      console.log('Waiting for confirmation...');
      
      const whitelistReceipt = await whitelistTx.wait();
      console.log('✅ Whitelist confirmed in block:', whitelistReceipt.blockNumber);
    } else {
      console.log('✅ Token already whitelisted');
    }
    
    console.log('\n========================================');
    console.log('🎉 SUCCESS! Faucet is ready to use!');
    console.log('========================================');
    console.log('Faucet address:', FAUCET);
    console.log('ZYL balance:', ethers.formatEther(newBalance), 'ZYL');
    console.log('Users can now request 100 ZYL tokens');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    if (error.code) console.error('Code:', error.code);
    process.exit(1);
  }
}

main().catch(console.error);
