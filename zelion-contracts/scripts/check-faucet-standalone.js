const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses from verified deployment on Arbitrum Sepolia
// Testing both addresses to find the actual ZYL token
const ZYL_TOKEN_1 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ZYL_TOKEN_2 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; 
const FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0"; // Verified Faucet address

// ABIs (minimal required functions)
const ZYL_ABI = [
  "function balanceOf(address account) view returns (uint256)"
];

const FAUCET_ABI = [
  "function tokenWhitelist(address) view returns (bool)",
  "function tokenAmount() view returns (uint256)",
  "function cooldownTime() view returns (uint256)",
  "function lastRequestTime(address) view returns (uint256)"
];

async function main() {
  try {
    console.log("Checking faucet status on Arbitrum Sepolia...\n");
    console.log("RPC URL:", process.env.ARBITRUM_SEPOLIA_RPC_URL);
    
    // Connect to Arbitrum Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC_URL);
    
    // Check network
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "(chainId:", network.chainId.toString(), ")\n");
    
    // Check both potential ZYL token addresses
    const code1 = await provider.getCode(ZYL_TOKEN_1);
    const code2 = await provider.getCode(ZYL_TOKEN_2);
    const faucetCode = await provider.getCode(FAUCET);
    
    console.log("Checking addresses:");
    console.log("Address 1 (0x5FbDB...):", code1 === "0x" ? "No contract" : "Contract exists");
    console.log("Address 2 (0x9fE46...):", code2 === "0x" ? "No contract" : "Contract exists");
    console.log("Faucet (0xAc7c2...):", faucetCode === "0x" ? "No contract" : "Contract exists\n");
    
    // Determine which is the actual ZYL token
    let ZYL_TOKEN = null;
    if (code1 !== "0x") {
      ZYL_TOKEN = ZYL_TOKEN_1;
      console.log("Using ZYL Token at:", ZYL_TOKEN_1);
    } else if (code2 !== "0x") {
      ZYL_TOKEN = ZYL_TOKEN_2;
      console.log("Using ZYL Token at:", ZYL_TOKEN_2);
    } else {
      console.error("❌ No ZYL Token contract found at either address");
      console.log("The contracts may not be deployed on Arbitrum Sepolia yet.");
      return;
    }
    
    if (faucetCode === "0x") {
      console.error("❌ Faucet contract not found at", FAUCET);
      return;
    }
    
    // Create contract instances
    const zylToken = new ethers.Contract(ZYL_TOKEN, ZYL_ABI, provider);
    const faucet = new ethers.Contract(FAUCET, FAUCET_ABI, provider);
    
    // Check faucet balance
    const balance = await zylToken.balanceOf(FAUCET);
    console.log("Faucet ZYL balance:", ethers.formatEther(balance), "ZYL");
    
    // Check if token is whitelisted
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    console.log("ZYL token whitelisted:", isWhitelisted);
    
    // Check token amount per request
    const tokenAmount = await faucet.tokenAmount();
    console.log("Tokens per request:", ethers.formatEther(tokenAmount), "ZYL");
    
    // Check cooldown period
    const cooldownTime = await faucet.cooldownTime();
    console.log("Cooldown period:", Number(cooldownTime) / 3600, "hours");
    
    console.log("\n========================================");
    if (balance > 0n && isWhitelisted) {
      console.log("✅ Faucet is READY!");
      console.log("Users can request tokens from the frontend");
      console.log("Faucet has", ethers.formatEther(balance), "ZYL available");
    } else {
      console.log("❌ Faucet needs setup:");
      if (balance === 0n) console.log("  - Need to mint tokens to faucet");
      if (!isWhitelisted) console.log("  - Need to whitelist ZYL token");
    }
    console.log("========================================");
    
  } catch (error) {
    console.error("Error checking faucet status:", error.message);
    process.exit(1);
  }
}

main();
