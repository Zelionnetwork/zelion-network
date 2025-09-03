const hre = require("hardhat");

async function main() {
  console.log("Funding existing faucet with ZYL tokens...\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer:", signer.address);
  
  // Contract addresses
  const FAUCET = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  const ZYL_TOKEN = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // Get ZYL token contract
  const zylToken = await hre.ethers.getContractAt("ZYLToken", ZYL_TOKEN);
  
  // Check current faucet balance
  const currentBalance = await zylToken.balanceOf(FAUCET);
  console.log("Current faucet balance:", hre.ethers.formatEther(currentBalance), "ZYL");
  
  // Amount to fund (1 million ZYL)
  const fundAmount = hre.ethers.parseEther("1000000");
  
  console.log("\nFunding faucet with 1,000,000 ZYL...");
  
  try {
    // Option 1: Try to mint directly to faucet (if signer is owner)
    console.log("Attempting to mint tokens to faucet...");
    const mintTx = await zylToken.mint(FAUCET, fundAmount);
    await mintTx.wait();
    console.log("✅ Minted 1,000,000 ZYL to faucet");
  } catch (error) {
    console.log("⚠️ Cannot mint (not token owner)");
    
    // Option 2: Transfer from signer's balance
    console.log("\nAttempting to transfer from your balance...");
    try {
      const signerBalance = await zylToken.balanceOf(signer.address);
      console.log("Your ZYL balance:", hre.ethers.formatEther(signerBalance));
      
      if (signerBalance >= fundAmount) {
        const transferTx = await zylToken.transfer(FAUCET, fundAmount);
        await transferTx.wait();
        console.log("✅ Transferred 1,000,000 ZYL to faucet");
      } else {
        console.log("❌ Insufficient balance. You need at least 1,000,000 ZYL");
      }
    } catch (err) {
      console.log("❌ Transfer failed:", err.message);
    }
  }
  
  // Check new balance
  const newBalance = await zylToken.balanceOf(FAUCET);
  console.log("\nNew faucet balance:", hre.ethers.formatEther(newBalance), "ZYL");
  
  if (newBalance > currentBalance) {
    console.log("✅ Faucet funded successfully!");
  } else {
    console.log("\n⚠️ To fund the faucet manually:");
    console.log("1. Ensure you have ZYL tokens in your wallet");
    console.log("2. Send ZYL tokens to:", FAUCET);
    console.log("3. Or if you're the token owner, mint directly to the faucet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
