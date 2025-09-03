require('dotenv').config();

const { ethers } = require('ethers');

(async () => {
  try {
    // Connect
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Using wallet:', wallet.address);
    
    // Contracts
    const ZYL = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
    
    // ABIs
    const tokenABI = ['function mint(address to, uint256 amount)', 'function balanceOf(address) view returns (uint256)'];
    const faucetABI = ['function whitelistToken(address token, bool status)', 'function tokenWhitelist(address) view returns (bool)'];
    
    const token = new ethers.Contract(ZYL, tokenABI, wallet);
    const faucet = new ethers.Contract(FAUCET, faucetABI, wallet);
    
    // Check balance before
    const before = await token.balanceOf(FAUCET);
    console.log('Faucet balance before:', ethers.formatEther(before), 'ZYL');
    
    // Mint
    console.log('Minting 1,000,000 ZYL to faucet...');
    const mintTx = await token.mint(FAUCET, ethers.parseEther('1000000'));
    console.log('Mint TX:', mintTx.hash);
    await mintTx.wait();
    
    // Check balance after
    const after = await token.balanceOf(FAUCET);
    console.log('Faucet balance after:', ethers.formatEther(after), 'ZYL');
    
    // Whitelist
    const isWhitelisted = await faucet.tokenWhitelist(ZYL);
    if (!isWhitelisted) {
      console.log('Whitelisting ZYL...');
      const wlTx = await faucet.whitelistToken(ZYL, true);
      console.log('Whitelist TX:', wlTx.hash);
      await wlTx.wait();
    }
    
    console.log('\n✅ Done! Faucet has', ethers.formatEther(after), 'ZYL');
    
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
