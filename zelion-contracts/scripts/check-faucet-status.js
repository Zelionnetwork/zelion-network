const hre = require("hardhat");

async function main() {
  const ZYL_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  
  console.log("Checking faucet status...\n");
  
  // Get contracts
  const ZYLToken = await hre.ethers.getContractFactory("ZYLToken");
  const zylToken = ZYLToken.attach(ZYL_TOKEN);
  
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = Faucet.attach(FAUCET);
  
  // Check faucet balance
  const balance = await zylToken.balanceOf(FAUCET);
  console.log("Faucet ZYL balance:", hre.ethers.formatEther(balance), "ZYL");
  
  // Check if token is whitelisted
  const isWhitelisted = await faucet.tokenWhitelist(ZYL_TOKEN);
  console.log("ZYL token whitelisted:", isWhitelisted);
  
  // Check token amount per request
  const tokenAmount = await faucet.tokenAmount();
  console.log("Tokens per request:", hre.ethers.formatEther(tokenAmount), "ZYL");
  
  // Check cooldown period
  const cooldownTime = await faucet.cooldownTime();
  console.log("Cooldown period:", Number(cooldownTime) / 3600, "hours");
  
  console.log("\n========================================");
  if (balance > 0n && isWhitelisted) {
    console.log("✅ Faucet is READY!");
    console.log("Users can request tokens from the frontend");
  } else {
    console.log("❌ Faucet needs setup:");
    if (balance === 0n) console.log("  - Need to mint tokens to faucet");
    if (!isWhitelisted) console.log("  - Need to whitelist ZYL token");
  }
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
