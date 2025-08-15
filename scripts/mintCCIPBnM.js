const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Minting CCIP-BnM tokens...");

  // CCIP-BnM token address on Arbitrum Sepolia
  const CCIP_BNM_ADDRESS = "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // CCIP-BnM token ABI (includes drip function)
  const ccipBnmAbi = [
    "function drip(address to) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
  ];

  // Connect to CCIP-BnM contract
  const ccipBnmContract = new ethers.Contract(CCIP_BNM_ADDRESS, ccipBnmAbi, signer);

  try {
    // Check current balance
    const balanceBefore = await ccipBnmContract.balanceOf(signer.address);
    console.log("Balance before:", ethers.formatEther(balanceBefore), "CCIP-BnM");

    // CCIP-BnM drip function typically gives 1 token per call
    // To get 10,000 tokens, we need to call drip multiple times
    console.log("🔄 Minting CCIP-BnM tokens (this may take several transactions)...");
    
    const targetAmount = 10000;
    const tokensPerDrip = 1; // CCIP-BnM typically gives 1 token per drip
    const dripsNeeded = Math.ceil(targetAmount / tokensPerDrip);
    
    console.log(`Need ${dripsNeeded} drip calls to get ${targetAmount} tokens`);
    
    // Batch drip calls (do 10 at a time to avoid overwhelming the network)
    const batchSize = 10;
    let totalDrips = 0;
    
    for (let i = 0; i < dripsNeeded; i += batchSize) {
      const currentBatch = Math.min(batchSize, dripsNeeded - i);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}: ${currentBatch} drips`);
      
      const promises = [];
      for (let j = 0; j < currentBatch; j++) {
        promises.push(ccipBnmContract.drip(signer.address));
      }
      
      try {
        const txs = await Promise.all(promises);
        console.log(`✅ Batch completed: ${currentBatch} transactions sent`);
        
        // Wait for all transactions in this batch
        for (const tx of txs) {
          await tx.wait();
        }
        
        totalDrips += currentBatch;
        console.log(`Progress: ${totalDrips}/${dripsNeeded} drips completed`);
        
        // Small delay between batches
        if (i + batchSize < dripsNeeded) {
          console.log("⏳ Waiting 2 seconds before next batch...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        break;
      }
    }

    // Check final balance
    console.log("\n🔍 Checking final balance...");
    const balanceAfter = await ccipBnmContract.balanceOf(signer.address);
    const balanceFormatted = ethers.formatEther(balanceAfter);
    
    console.log("✅ Final balance:", balanceFormatted, "CCIP-BnM");
    console.log("🎉 Minting completed!");
    
    if (parseFloat(balanceFormatted) >= targetAmount) {
      console.log(`🎯 Target achieved! You now have ${balanceFormatted} CCIP-BnM tokens`);
    } else {
      console.log(`⚠️  Partial success: Got ${balanceFormatted} out of ${targetAmount} target tokens`);
    }

  } catch (error) {
    console.error("❌ Error minting CCIP-BnM tokens:", error);
    
    if (error.message.includes("drip")) {
      console.log("\n💡 Alternative: Try using the Chainlink faucet:");
      console.log("https://faucets.chain.link/arbitrum-sepolia");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
