const { ethers } = require('ethers');
require('dotenv').config();

console.log('Testing connection...');

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
  console.error('ERROR: Please set PRIVATE_KEY in .env file');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log('Your wallet address:', wallet.address);

provider.getBalance(wallet.address).then(balance => {
  console.log('ETH Balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance === 0n) {
    console.log('WARNING: No ETH for gas fees!');
  }
  
  // Test contract read
  const token = new ethers.Contract(
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    ['function owner() view returns (address)'],
    provider
  );
  
  return token.owner();
}).then(owner => {
  console.log('ZYL Token owner:', owner);
  console.log('Is you the owner?', owner.toLowerCase() === wallet.address.toLowerCase());
}).catch(err => {
  console.error('ERROR:', err.message);
});
