const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting faucet setup...");
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);
    
    // Contract addresses
    const FAUCET_ADDRESS = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
    const ZYL_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // Get ZYL Token contract
    console.log("Getting ZYL Token contract...");
    const zylToken = await ethers.getContractAt("ZYLToken", ZYL_TOKEN_ADDRESS, signer);
    
    // Check owner
    const owner = await zylToken.owner();
    console.log("Token owner:", owner);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.error("Error: You are not the owner of the ZYL token contract");
      console.error("Owner:", owner);
      console.error("Your address:", signer.address);
      return;
    }
    
    // Check current balance
    const currentBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
    console.log("Current faucet balance:", ethers.formatEther(currentBalance), "ZYL");
    
    // Mint 1 million tokens
    const mintAmount = ethers.parseEther("1000000");
    console.log("Minting 1,000,000 ZYL tokens to faucet...");
    
    const tx = await zylToken.mint(FAUCET_ADDRESS, mintAmount);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Check new balance
    const newBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
    console.log("New faucet balance:", ethers.formatEther(newBalance), "ZYL");
    
    console.log("\n✅ Successfully minted 1,000,000 ZYL tokens to the faucet!");
    
    // Now whitelist the token
    console.log("\nWhitelisting ZYL token in faucet...");
    const faucet = await ethers.getContractAt("Faucet", FAUCET_ADDRESS, signer);
    
    const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN_ADDRESS);
    if (!isWhitelisted) {
      const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN_ADDRESS, true);
      console.log("Whitelist transaction hash:", whitelistTx.hash);
      await whitelistTx.wait();
      console.log("✅ ZYL token whitelisted!");
    } else {
      console.log("✅ ZYL token is already whitelisted!");
    }
    
    console.log("\n🎉 Faucet is ready to distribute ZYL tokens!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
