const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Minting CCIP-BnM tokens (simple approach)...");

  // CCIP-BnM token address on Arbitrum Sepolia
  const CCIP_BNM_ADDRESS = "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // CCIP-BnM token ABI
  const ccipBnmAbi = [
    "function drip(address to) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];

  // Connect to CCIP-BnM contract
  const ccipBnmContract = new ethers.Contract(CCIP_BNM_ADDRESS, ccipBnmAbi, signer);

  try {
    // Check current balance
    const balanceBefore = await ccipBnmContract.balanceOf(signer.address);
    console.log("Balance before:", ethers.formatEther(balanceBefore), "CCIP-BnM");

    // Call drip function 20 times (should give us 20 CCIP-BnM tokens)
    console.log("🔄 Calling drip function 20 times...");
    
    for (let i = 0; i < 20; i++) {
      try {
        console.log(`Drip ${i + 1}/20...`);
        const tx = await ccipBnmContract.drip(signer.address);
        await tx.wait();
        console.log(`✅ Drip ${i + 1} completed`);
      } catch (error) {
        console.log(`⚠️ Drip ${i + 1} failed:`, error.message);
        if (error.message.includes("rate limit") || error.message.includes("cooldown")) {
          console.log("⏳ Waiting 5 seconds before retry...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          i--; // Retry this drip
        }
      }
    }

    // Check final balance
    const balanceAfter = await ccipBnmContract.balanceOf(signer.address);
    const balanceFormatted = ethers.formatEther(balanceAfter);
    
    console.log("\n✅ Final balance:", balanceFormatted, "CCIP-BnM");
    console.log("🎉 Minting completed!");
    
    if (parseFloat(balanceFormatted) > parseFloat(ethers.formatEther(balanceBefore))) {
      console.log("🎯 Successfully minted CCIP-BnM tokens!");
      console.log("💡 You can now test the bridge approval with CCIP-BnM tokens");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Alternative options:");
    console.log("1. Use Chainlink faucet: https://faucets.chain.link/arbitrum-sepolia");
    console.log("2. Try bridging with a smaller amount first");
    console.log("3. Check if you already have CCIP-BnM tokens in your wallet");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
