const hre = require("hardhat");

async function main() {
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Contract addresses
  const ZYL_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  
  // Get contracts
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = ZYLToken.attach(ZYL_TOKEN);
  
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = Faucet.attach(FAUCET);
  
  // Check ownership
  const owner = await zylToken.owner();
  console.log("Token owner:", owner);
  
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("ERROR: You are not the owner!");
    console.error("Owner:", owner);
    console.error("Your address:", signer.address);
    process.exit(1);
  }
  
  // Check current balance
  const currentBalance = await zylToken.balanceOf(FAUCET);
  console.log("Current faucet balance:", hre.ethers.formatEther(currentBalance), "ZYL");
  
  // Mint 1 million tokens
  console.log("\nMinting 1,000,000 ZYL to faucet...");
  const mintTx = await zylToken.mint(FAUCET, hre.ethers.parseEther("1000000"));
  console.log("Transaction hash:", mintTx.hash);
  await mintTx.wait();
  console.log("✅ Minted successfully!");
  
  // Check new balance
  const newBalance = await zylToken.balanceOf(FAUCET);
  console.log("New faucet balance:", hre.ethers.formatEther(newBalance), "ZYL");
  
  // Whitelist token
  console.log("\nChecking whitelist status...");
  const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
  
  if (!isWhitelisted) {
    console.log("Whitelisting ZYL token...");
    const whitelistTx = await faucet.whitelistToken(ZYL_TOKEN, true);
    console.log("Transaction hash:", whitelistTx.hash);
    await whitelistTx.wait();
    console.log("✅ Token whitelisted!");
  } else {
    console.log("✅ Token already whitelisted!");
  }
  
  console.log("\n========================================");
  console.log("🎉 SUCCESS! Faucet is ready!");
  console.log("Faucet has", hre.ethers.formatEther(newBalance), "ZYL");
  console.log("Users can request 100 ZYL every 24 hours");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
