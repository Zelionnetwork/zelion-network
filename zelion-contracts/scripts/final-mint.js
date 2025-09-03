const { ethers } = require('ethers');
require('dotenv').config();

const ZYL = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';

async function run() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const token = new ethers.Contract(
    ZYL,
    ['function mint(address,uint256)', 'function balanceOf(address) view returns (uint256)', 'function owner() view returns (address)'],
    wallet
  );
  
  const faucet = new ethers.Contract(
    FAUCET,
    ['function whitelistToken(address,bool)', 'function tokenWhitelist(address) view returns (bool)'],
    wallet
  );
  
  // Check owner
  const owner = await token.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Not owner. Owner: ${owner}, You: ${wallet.address}`);
  }
  
  // Mint
  const tx1 = await token.mint(FAUCET, ethers.parseEther('1000000'));
  await tx1.wait();
  
  // Whitelist
  const whitelisted = await faucet.tokenWhitelist(ZYL);
  if (!whitelisted) {
    const tx2 = await faucet.whitelistToken(ZYL, true);
    await tx2.wait();
  }
  
  const balance = await token.balanceOf(FAUCET);
  return ethers.formatEther(balance);
}

run()
  .then(balance => console.log(`SUCCESS! Faucet has ${balance} ZYL`))
  .catch(err => console.log(`ERROR: ${err.message}`));
