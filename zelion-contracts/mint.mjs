import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting mint process...');

const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ZYL = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';

const token = new ethers.Contract(
  ZYL,
  ['function mint(address to, uint256 amount)', 'function balanceOf(address) view returns (uint256)'],
  wallet
);

const faucet = new ethers.Contract(
  FAUCET,
  ['function whitelistToken(address token, bool status)', 'function tokenWhitelist(address) view returns (bool)'],
  wallet
);

try {
  console.log('Wallet:', wallet.address);
  
  const before = await token.balanceOf(FAUCET);
  console.log('Current balance:', ethers.formatEther(before), 'ZYL');
  
  console.log('Minting...');
  const mintTx = await token.mint(FAUCET, ethers.parseEther('1000000'));
  console.log('TX:', mintTx.hash);
  await mintTx.wait();
  
  const after = await token.balanceOf(FAUCET);
  console.log('New balance:', ethers.formatEther(after), 'ZYL');
  
  const isWhitelisted = await faucet.tokenWhitelist(ZYL);
  if (!isWhitelisted) {
    console.log('Whitelisting...');
    const wlTx = await faucet.whitelistToken(ZYL, true);
    await wlTx.wait();
  }
  
  console.log('✅ Done!');
} catch (error) {
  console.error('Error:', error.message);
}
