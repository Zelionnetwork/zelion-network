const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses
const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';

// ABIs
const TOKEN_ABI = [
  'function owner() view returns (address)',
  'function balanceOf(address) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function name() view returns (string)'
];

const FAUCET_ABI = [
  'function tokenWhitelist(address) view returns (bool)',
  'function whitelistToken(address token, bool status)',
  'function owner() view returns (address)'
];

async function main() {
  try {
    // Check environment
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
      console.error('ERROR: Please set your private key in .env file');
      console.error('Make sure PRIVATE_KEY is your MetaMask wallet private key (without 0x prefix)');
      process.exit(1);
    }

    // Setup provider and wallet
    console.log('Connecting to Arbitrum Sepolia...');
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    
    // Handle private key with or without 0x prefix
    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Connected with wallet:', wallet.address);

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log('ETH balance:', ethers.formatEther(ethBalance), 'ETH');
    
    if (ethBalance === 0n) {
      console.error('ERROR: You need ETH on Arbitrum Sepolia for gas fees');
      console.error('Get testnet ETH from: https://faucet.arbitrum.io/');
      process.exit(1);
    }

    // Create contract instances
    const zylToken = new ethers.Contract(ZYL_TOKEN, TOKEN_ABI, wallet);
    const faucet = new ethers.Contract(FAUCET, FAUCET_ABI, wallet);

    // Verify token contract
    const tokenName = await zylToken.name();
    console.log('\nToken found:', tokenName);

    // Check ownership
    console.log('\nChecking ownership...');
    const tokenOwner = await zylToken.owner();
    console.log('Token owner:', tokenOwner);
    console.log('Your address:', wallet.address);
    
    if (tokenOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('\nERROR: You are not the owner of the ZYL token');
      console.error('The owner is:', tokenOwner);
      console.error('Your address is:', wallet.address);
      console.error('\nMake sure you are using the same wallet that deployed the contracts');
      process.exit(1);
    }
    console.log('✅ Ownership verified');

    // Check current faucet balance
    console.log('\nChecking faucet balance...');
    const currentBalance = await zylToken.balanceOf(FAUCET);
    console.log('Current faucet balance:', ethers.formatEther(currentBalance), 'ZYL');

    // Mint tokens if needed
    if (currentBalance < ethers.parseEther('100000')) {
      console.log('\n📝 Minting 1,000,000 ZYL tokens to faucet...');
      const mintAmount = ethers.parseEther('1000000');
      
      const mintTx = await zylToken.mint(FAUCET, mintAmount, {
        gasLimit: 300000n
      });
      
      console.log('Transaction sent:', mintTx.hash);
      console.log('Waiting for confirmation...');
      
      const mintReceipt = await mintTx.wait();
      console.log('✅ Minting confirmed in block:', mintReceipt.blockNumber);
      
      // Verify new balance
      const newBalance = await zylToken.balanceOf(FAUCET);
      console.log('New faucet balance:', ethers.formatEther(newBalance), 'ZYL');
    } else {
      console.log('✅ Faucet already has sufficient tokens');
    }

    // Check and set whitelist
    console.log('\nChecking whitelist status...');
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    console.log('Currently whitelisted:', isWhitelisted);
    
    if (!isWhitelisted) {
      console.log('📝 Whitelisting ZYL token in faucet...');
      
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true, {
        gasLimit: 150000n
      });
      
      console.log('Transaction sent:', whitelistTx.hash);
      console.log('Waiting for confirmation...');
      
      const whitelistReceipt = await whitelistTx.wait();
      console.log('✅ Whitelisting confirmed in block:', whitelistReceipt.blockNumber);
    } else {
      console.log('✅ Token already whitelisted');
    }

    // Final status
    const finalBalance = await zylToken.balanceOf(FAUCET);
    const finalWhitelist = await faucet.tokenWhitelist(ZYL_TOKEN);
    
    console.log('\n========================================');
    console.log('🎉 SUCCESS! FAUCET IS READY!');
    console.log('========================================');
    console.log('Faucet address:', FAUCET);
    console.log('ZYL balance:', ethers.formatEther(finalBalance));
    console.log('Whitelisted:', finalWhitelist);
    console.log('\nUsers can now request 100 ZYL tokens');
    console.log('from the frontend every 24 hours!');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    
    if (error.code === 'INVALID_ARGUMENT') {
      console.error('\nThis usually means your private key is invalid');
      console.error('Make sure it is 64 characters (without 0x prefix)');
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('\nYou need more ETH for gas fees on Arbitrum Sepolia');
    }
    
    if (error.code === 'CALL_EXCEPTION') {
      console.error('\nContract call failed. This might mean:');
      console.error('- You are not the owner of the token');
      console.error('- The contract addresses are incorrect');
      console.error('- The contracts are not deployed on this network');
    }
    
    process.exit(1);
  }
}

// Run the script
console.log('Starting Faucet Setup Script...\n');
main();
