require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // Connect to Arbitrum Sepolia
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Connected wallet:', wallet.address);
  
  // Contract addresses
  const ZYL_TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // ZYL Token ABI (only what we need)
  const tokenABI = [
    'function owner() view returns (address)',
    'function balanceOf(address) view returns (uint256)',
    'function mint(address to, uint256 amount)',
  ];
  
  // Faucet ABI
  const faucetABI = [
    'function tokenWhitelist(address) view returns (bool)',
    'function whitelistToken(address token, bool status)',
  ];
  
  // Get contracts
  const zylToken = new ethers.Contract(ZYL_TOKEN, tokenABI, wallet);
  const faucet = new ethers.Contract(FAUCET, faucetABI, wallet);
  
  try {
    // Check owner
    const owner = await zylToken.owner();
    console.log('Token owner:', owner);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('ERROR: You are not the owner of the token contract');
      console.log('Your address:', wallet.address);
      return;
    }
    
    // Check current balance
    const balance = await zylToken.balanceOf(FAUCET);
    console.log('Current faucet balance:', ethers.formatEther(balance), 'ZYL');
    
    // Mint 1 million tokens
    console.log('\nMinting 1,000,000 ZYL to faucet...');
    const mintTx = await zylToken.mint(FAUCET, ethers.parseEther('1000000'));
    console.log('TX hash:', mintTx.hash);
    console.log('Waiting for confirmation...');
    await mintTx.wait();
    console.log('✅ Minted successfully!');
    
    // Check new balance
    const newBalance = await zylToken.balanceOf(FAUCET);
    console.log('New faucet balance:', ethers.formatEther(newBalance), 'ZYL');
    
    // Whitelist token
    console.log('\nChecking whitelist status...');
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    
    if (!isWhitelisted) {
      console.log('Whitelisting ZYL token...');
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true);
      console.log('TX hash:', whitelistTx.hash);
      await whitelistTx.wait();
      console.log('✅ Token whitelisted!');
    } else {
      console.log('✅ Token already whitelisted!');
    }
    
    console.log('\n🎉 Faucet setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
