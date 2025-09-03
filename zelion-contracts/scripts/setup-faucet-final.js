const hre = require("hardhat");

async function main() {
  try {
    console.log("Setting up faucet on Arbitrum Sepolia...\n");
    
    const signers = await hre.ethers.getSigners();
    if (!signers || signers.length === 0) {
      throw new Error("No signers available. Check your private key in .env");
    }
    
    const signer = signers[0];
    console.log("Using wallet:", signer.address);
    
    // Get provider and check balance
    const balance = await signer.provider.getBalance(signer.address);
    console.log("ETH balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("No ETH for gas fees. Please fund your wallet on Arbitrum Sepolia");
    }
    
    // Contract addresses
    const ZYL_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
    
    console.log("\nContracts:");
    console.log("ZYL Token:", ZYL_TOKEN);
    console.log("Faucet:", FAUCET);
    
    // Get contract factories
    const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
    const zylToken = ZYLToken.attach(ZYL_TOKEN);
    
    const Faucet = await hre.ethers.getContractFactory("Faucet");
    const faucet = Faucet.attach(FAUCET);
    
    // Step 1: Check ownership
    console.log("\n1. Checking ownership...");
    const owner = await zylToken.owner();
    console.log("Token owner:", owner);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(`You are not the owner. Owner is ${owner}, you are ${signer.address}`);
    }
    console.log("✅ You are the owner");
    
    // Step 2: Check current faucet balance
    console.log("\n2. Checking faucet balance...");
    const currentBalance = await zylToken.balanceOf(FAUCET);
    console.log("Current balance:", hre.ethers.formatEther(currentBalance), "ZYL");
    
    // Step 3: Check whitelist status
    console.log("\n3. Checking whitelist status...");
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
    console.log("Is whitelisted:", isWhitelisted);
    
    // Step 4: Mint if needed
    if (currentBalance < hre.ethers.parseEther("100000")) {
      console.log("\n4. Minting 1,000,000 ZYL to faucet...");
      const mintTx = await zylToken.mint(FAUCET, hre.ethers.parseEther("1000000"));
      console.log("TX sent:", mintTx.hash);
      const receipt = await mintTx.wait();
      console.log("✅ Minted in block", receipt.blockNumber);
      
      const newBalance = await zylToken.balanceOf(FAUCET);
      console.log("New balance:", hre.ethers.formatEther(newBalance), "ZYL");
    } else {
      console.log("\n4. Faucet already has sufficient balance");
    }
    
    // Step 5: Whitelist if needed
    if (!isWhitelisted) {
      console.log("\n5. Whitelisting ZYL token...");
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true);
      console.log("TX sent:", whitelistTx.hash);
      const receipt = await whitelistTx.wait();
      console.log("✅ Whitelisted in block", receipt.blockNumber);
    } else {
      console.log("\n5. Token already whitelisted");
    }
    
    // Final check
    const finalBalance = await zylToken.balanceOf(FAUCET);
    const finalWhitelist = await faucet.tokenWhitelist(ZYL_TOKEN);
    
    console.log("\n========================================");
    console.log("🎉 FAUCET SETUP COMPLETE!");
    console.log("========================================");
    console.log("Faucet balance:", hre.ethers.formatEther(finalBalance), "ZYL");
    console.log("Token whitelisted:", finalWhitelist);
    console.log("Users can now request 100 ZYL every 24 hours");
    console.log("========================================");
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
