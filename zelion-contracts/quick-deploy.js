const { ethers } = require('ethers');
require('dotenv').config();

console.log("Starting deployment script...");

// Verify environment
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
  console.error("ERROR: Private key not set in .env file");
  process.exit(1);
}

console.log("Private key loaded successfully");
console.log("Connecting to Arbitrum Sepolia...");

const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

provider.getBalance(wallet.address).then(balance => {
  console.log("Wallet:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("Insufficient balance for deployment");
  } else {
    console.log("Ready to deploy!");
    console.log("\nPlease run: node direct-deploy.js");
  }
}).catch(error => {
  console.error("Error:", error.message);
});
