const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  try {
    console.log('Starting...');
    
    if (!process.env.PRIVATE_KEY) {
      console.error('ERROR: PRIVATE_KEY not found in .env file');
      return;
    }
    
    if (process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
      console.error('ERROR: Please update PRIVATE_KEY in .env file');
      return;
    }
    
    // Connect to Arbitrum Sepolia
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    console.log('Connecting to Arbitrum Sepolia...');
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('Wallet:', wallet.address);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    console.log('ETH Balance:', ethers.formatEther(balance));
    
    if (balance === 0n) {
      console.error('ERROR: No ETH balance for gas fees');
      return;
    }
    
    // Contract addresses
    const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
    
    // Token ABI
    const tokenABI = [
      'function owner() view returns (address)',
      'function balanceOf(address) view returns (uint256)',
      'function mint(address to, uint256 amount)'
    ];
    
    // Faucet ABI  
    const faucetABI = [
      'function tokenWhitelist(address) view returns (bool)',
      'function whitelistToken(address token, bool status)'
    ];
    
    const zylToken = new ethers.Contract(ZYL_TOKEN, tokenABI, wallet);
    const faucet = new ethers.Contract(FAUCET, faucetABI, wallet);
    
    // Check ownership
    console.log('\nChecking ownership...');
    const owner = await zylToken.owner();
    console.log('Token owner:', owner);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('ERROR: You are not the owner');
      console.error('Expected:', wallet.address);
      return;
    }
    
    // Check faucet balance
    const faucetBalance = await zylToken.balanceOf(FAUCET);
    console.log('Faucet has:', ethers.formatEther(faucetBalance), 'ZYL');
    
    // Mint tokens
    console.log('\nMinting 1,000,000 ZYL to faucet...');
    const mintTx = await zylToken.mint(FAUCET, ethers.parseEther('1000000'), {
      gasLimit: 200000
    });
    console.log('TX:', mintTx.hash);
    await mintTx.wait();
    console.log('✅ Minted!');
    
    // Check whitelist
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    if (!isWhitelisted) {
      console.log('\nWhitelisting token...');
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true, {
        gasLimit: 100000
      });
      console.log('TX:', whitelistTx.hash);
      await whitelistTx.wait();
      console.log('✅ Whitelisted!');
    } else {
      console.log('✅ Already whitelisted!');
    }
    
    console.log('\n🎉 Done! Faucet is ready.');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    if (error.transaction) console.error('Failed TX:', error.transaction);
  }
}

main();
