console.log('Script starting...');

const { ethers } = require('ethers');
require('dotenv').config();

console.log('Modules loaded');

// Contract addresses
const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';

async function main() {
  console.log('Main function started');
  
  try {
    // Check private key
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in .env');
    }
    
    if (process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
      throw new Error('Please update PRIVATE_KEY in .env file');
    }
    
    console.log('Private key loaded');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    console.log('Provider created');
    
    // Create wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('Wallet address:', wallet.address);
    
    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log('ETH balance:', ethers.formatEther(ethBalance), 'ETH');
    
    if (ethBalance === 0n) {
      throw new Error('No ETH for gas fees');
    }
    
    // Create contracts
    const zylToken = new ethers.Contract(
      ZYL_TOKEN,
      [
        'function owner() view returns (address)',
        'function balanceOf(address) view returns (uint256)',
        'function mint(address to, uint256 amount)'
      ],
      wallet
    );
    
    const faucet = new ethers.Contract(
      FAUCET,
      [
        'function tokenWhitelist(address) view returns (bool)',
        'function whitelistToken(address token, bool status)'
      ],
      wallet
    );
    
    console.log('Contracts created');
    
    // Check owner
    const owner = await zylToken.owner();
    console.log('Token owner:', owner);
    console.log('Your address:', wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Not the owner. Owner is ${owner}, you are ${wallet.address}`);
    }
    
    console.log('✅ You are the owner');
    
    // Check current faucet balance
    const currentBalance = await zylToken.balanceOf(FAUCET);
    console.log('Current faucet balance:', ethers.formatEther(currentBalance), 'ZYL');
    
    // Mint 1M tokens
    console.log('\nMinting 1,000,000 ZYL to faucet...');
    const mintAmount = ethers.parseEther('1000000');
    
    const mintTx = await zylToken.mint(FAUCET, mintAmount, {
      gasLimit: 300000n
    });
    
    console.log('Mint TX sent:', mintTx.hash);
    console.log('Waiting for confirmation...');
    
    const mintReceipt = await mintTx.wait();
    console.log('✅ Mint confirmed in block', mintReceipt.blockNumber);
    
    // Check new balance
    const newBalance = await zylToken.balanceOf(FAUCET);
    console.log('New faucet balance:', ethers.formatEther(newBalance), 'ZYL');
    
    // Check whitelist
    console.log('\nChecking whitelist status...');
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    console.log('Is whitelisted:', isWhitelisted);
    
    if (!isWhitelisted) {
      console.log('Whitelisting token...');
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true, {
        gasLimit: 150000n
      });
      console.log('Whitelist TX sent:', whitelistTx.hash);
      await whitelistTx.wait();
      console.log('✅ Token whitelisted');
    } else {
      console.log('✅ Token already whitelisted');
    }
    
    console.log('\n========================================');
    console.log('🎉 SUCCESS! Faucet is ready!');
    console.log('Faucet balance:', ethers.formatEther(newBalance), 'ZYL');
    console.log('Users can request 100 ZYL every 24 hours');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

console.log('Calling main...');
main().then(() => {
  console.log('Script complete');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
