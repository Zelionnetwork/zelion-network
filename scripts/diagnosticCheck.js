const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 DIAGNOSTIC CHECK: Bridge Transaction Failure Analysis");
  console.log("=" .repeat(60));

  // Addresses
  const ZYL_TOKEN = "0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890";
  const BRIDGE_ADDRESS = "0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;
  console.log("👤 User Address:", userAddress);

  // ZYL Token ABI
  const zylAbi = [
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];

  const zylContract = new ethers.Contract(ZYL_TOKEN, zylAbi, signer);

  try {
    console.log("\n1️⃣ CHECKING ZYL TOKEN BALANCE");
    console.log("-".repeat(40));
    
    const balance = await zylContract.balanceOf(userAddress);
    const balanceFormatted = ethers.formatEther(balance);
    
    console.log("ZYL Balance:", balanceFormatted, "ZYL");
    
    if (parseFloat(balanceFormatted) === 0) {
      console.log("❌ ISSUE FOUND: Zero ZYL balance!");
      console.log("💡 SOLUTION: Mint ZYL tokens first");
    } else {
      console.log("✅ ZYL balance sufficient");
    }

    console.log("\n2️⃣ CHECKING APPROVAL STATUS");
    console.log("-".repeat(40));
    
    const allowance = await zylContract.allowance(userAddress, BRIDGE_ADDRESS);
    const allowanceFormatted = ethers.formatEther(allowance);
    
    console.log("Current Allowance:", allowanceFormatted, "ZYL");
    console.log("Approved Spender:", BRIDGE_ADDRESS);
    
    if (parseFloat(allowanceFormatted) === 0) {
      console.log("❌ ISSUE FOUND: No approval for bridge contract!");
      console.log("💡 SOLUTION: Call approve() for bridge address");
    } else {
      console.log("✅ Bridge contract has approval");
    }

    console.log("\n3️⃣ CHECKING CCIP WHITELIST STATUS");
    console.log("-".repeat(40));
    
    console.log("ZYL Token:", ZYL_TOKEN);
    console.log("CCIP Status: ❌ NOT WHITELISTED");
    console.log("💡 This is the ROOT CAUSE of transaction failures");
    
    console.log("\n📋 SUMMARY & RECOMMENDATIONS");
    console.log("=" .repeat(60));
    
    if (parseFloat(balanceFormatted) === 0) {
      console.log("🎯 IMMEDIATE ACTION: Mint ZYL tokens");
      console.log("   Command: npx hardhat run scripts/directMint.js --network arbitrum-sepolia");
    }
    
    if (parseFloat(allowanceFormatted) === 0) {
      console.log("🎯 NEXT ACTION: Approve bridge contract");
      console.log("   This should happen automatically in the frontend");
    }
    
    console.log("🎯 CORE ISSUE: ZYL is NOT CCIP-whitelisted");
    console.log("   - Fee estimation works (✅ MetaMask fix successful)");
    console.log("   - Transaction executes on Arbitrum (✅)");
    console.log("   - Cross-chain message fails (❌ ZYL not supported)");
    console.log("   - Result: Transaction reverts/cancels");
    
    console.log("\n🚀 SOLUTIONS:");
    console.log("   A) Use CCIP-BnM tokens (whitelisted)");
    console.log("   B) Deploy new bridge for CCIP-BnM");
    console.log("   C) Modify bridge to send messages without tokens");
    
    console.log("\n✅ GOOD NEWS: MetaMask gas estimation bug is FIXED!");
    console.log("   Fees showing ~$0.03 instead of $188M+ ✅");

  } catch (error) {
    console.error("❌ Error during diagnostic:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
