const { ethers } = require('ethers');
require('dotenv').config();

async function test() {
  console.log("Testing deployment setup...");
  
  try {
    // Check environment variables
    if (!process.env.PRIVATE_KEY) {
      console.error("❌ PRIVATE_KEY not set in .env file");
      return;
    }
    
    if (!process.env.ARBITRUM_SEPOLIA_RPC_URL) {
      console.log("⚠️ ARBITRUM_SEPOLIA_RPC_URL not set, using default");
    }
    
    // Setup provider
    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    console.log("RPC URL:", rpcUrl);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId.toString());
    
    // Setup wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Wallet address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.error("❌ Insufficient balance for deployment (need at least 0.01 ETH)");
      return;
    }
    
    console.log("✅ Setup looks good! Ready to deploy.");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
