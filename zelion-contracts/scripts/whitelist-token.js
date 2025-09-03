const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Contract addresses from deployment
  const FAUCET_ADDRESS = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  const ZYL_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Whitelisting ZYL token in Faucet...");
  console.log("Deployer:", deployer.address);
  
  // Get Faucet contract
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = Faucet.attach(FAUCET_ADDRESS);
  
  // Check current whitelist status
  const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN_ADDRESS);
  console.log("Current whitelist status:", isWhitelisted);
  
  if (!isWhitelisted) {
    // Whitelist the ZYL token
    console.log("Whitelisting ZYL token...");
    const tx = await faucet.whitelistToken(ZYL_TOKEN_ADDRESS, true);
    console.log("Transaction sent:", tx.hash);
    
    await tx.wait();
    console.log("✅ ZYL token whitelisted successfully!");
    
    // Verify whitelist status
    const newStatus = await faucet.tokenWhitelist(ZYL_TOKEN_ADDRESS);
    console.log("New whitelist status:", newStatus);
  } else {
    console.log("✅ ZYL token is already whitelisted!");
  }
  
  // Also check if faucet has ZYL tokens
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = ZYLToken.attach(ZYL_TOKEN_ADDRESS);
  
  const faucetBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
  console.log("Faucet ZYL balance:", hre.ethers.formatEther(faucetBalance), "ZYL");
  
  if (faucetBalance < hre.ethers.parseEther("10000")) {
    console.log("\n⚠️  Warning: Faucet has low ZYL balance!");
    console.log("Consider transferring ZYL tokens to the faucet.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
