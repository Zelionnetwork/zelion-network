const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Contract addresses from deployment
  const FAUCET_ADDRESS = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  const ZYL_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Setting up Faucet with ZYL tokens...");
  console.log("Deployer:", deployer.address);
  console.log("-----------------------------------");
  
  // Get contracts
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = Faucet.attach(FAUCET_ADDRESS);
  
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = ZYLToken.attach(ZYL_TOKEN_ADDRESS);
  
  // Step 1: Check and whitelist ZYL token
  console.log("\n1. Checking ZYL token whitelist status...");
  const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN_ADDRESS);
  console.log("Current whitelist status:", isWhitelisted);
  
  if (!isWhitelisted) {
    console.log("Whitelisting ZYL token...");
    const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN_ADDRESS, true);
    console.log("Transaction sent:", whitelistTx.hash);
    await whitelistTx.wait();
    console.log("✅ ZYL token whitelisted successfully!");
  } else {
    console.log("✅ ZYL token is already whitelisted!");
  }
  
  // Step 2: Mint 1 million ZYL tokens to Faucet
  console.log("\n2. Minting ZYL tokens to Faucet...");
  const mintAmount = hre.ethers.parseEther("1000000"); // 1 million tokens
  
  // Check current faucet balance
  const currentBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
  console.log("Current Faucet balance:", hre.ethers.formatEther(currentBalance), "ZYL");
  
  // Check if deployer is the owner of ZYLToken
  const tokenOwner = await zylToken.owner();
  console.log("Token owner:", tokenOwner);
  console.log("Deployer address:", deployer.address);
  
  if (tokenOwner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("Minting 1,000,000 ZYL tokens to Faucet...");
    const mintTx = await zylToken.mint(FAUCET_ADDRESS, mintAmount);
    console.log("Transaction sent:", mintTx.hash);
    await mintTx.wait();
    console.log("✅ Successfully minted 1,000,000 ZYL tokens to Faucet!");
    
    // Verify new balance
    const newBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
    console.log("New Faucet balance:", hre.ethers.formatEther(newBalance), "ZYL");
  } else {
    console.log("❌ Error: Deployer is not the owner of ZYLToken contract");
    console.log("Token owner:", tokenOwner);
    console.log("Your address:", deployer.address);
    console.log("\nTo mint tokens, you need to use the owner account.");
  }
  
  // Step 3: Verify setup
  console.log("\n3. Verifying Faucet setup...");
  const finalWhitelistStatus = await faucet.tokenWhitelist(ZYL_TOKEN_ADDRESS);
  const finalBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
  
  console.log("-----------------------------------");
  console.log("✅ Faucet Setup Complete!");
  console.log("- ZYL Token whitelisted:", finalWhitelistStatus);
  console.log("- Faucet ZYL balance:", hre.ethers.formatEther(finalBalance), "ZYL");
  console.log("- Faucet can now distribute 100 ZYL per request");
  console.log("-----------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
