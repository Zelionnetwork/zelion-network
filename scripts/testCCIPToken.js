const { ethers } = require("hardhat");
const { getCCIPTestTokenAddress, getChainSelector } = require("../../zelion-site/src/app/config/tokenAddresses.js");

// CCIP-BnM Token ABI (includes drip function for minting test tokens)
const CCIP_BNM_ABI = [
  "function drip(address to) external",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Chainlink Router ABI for fee estimation
const ROUTER_ABI = [
  "function getFee(uint64 destinationChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) view returns (uint256 fee)"
];

async function main() {
  console.log("🧪 Testing CCIP Bridge with CCIP-BnM Token");
  
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();
  
  console.log(`👤 User Address: ${userAddress}`);
  
  // Get CCIP-BnM token address for Arbitrum Sepolia
  const ccipBnmAddress = getCCIPTestTokenAddress("Arbitrum Sepolia");
  console.log(`🪙 CCIP-BnM Token Address: ${ccipBnmAddress}`);
  
  if (!ccipBnmAddress) {
    console.error("❌ CCIP-BnM token address not found in config");
    return;
  }
  
  // Connect to CCIP-BnM token contract
  const ccipBnmToken = new ethers.Contract(ccipBnmAddress, CCIP_BNM_ABI, signer);
  
  try {
    // Check token details
    const name = await ccipBnmToken.name();
    const symbol = await ccipBnmToken.symbol();
    const decimals = await ccipBnmToken.decimals();
    
    console.log(`📋 Token Details: ${name} (${symbol}), ${decimals} decimals`);
    
    // Check current balance
    const balanceBefore = await ccipBnmToken.balanceOf(userAddress);
    console.log(`💰 Current Balance: ${ethers.formatEther(balanceBefore)} ${symbol}`);
    
    // Mint test tokens using drip function
    console.log("🚰 Minting test tokens using drip function...");
    const dripTx = await ccipBnmToken.drip(userAddress);
    await dripTx.wait();
    console.log(`✅ Drip transaction confirmed: ${dripTx.hash}`);
    
    // Check balance after minting
    const balanceAfter = await ccipBnmToken.balanceOf(userAddress);
    console.log(`💰 New Balance: ${ethers.formatEther(balanceAfter)} ${symbol}`);
    
    // Test fee estimation with CCIP Router
    const routerAddress = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165"; // Arbitrum Sepolia Router
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
    
    // Test fee estimation to Polygon Amoy
    const destinationChainSelector = getChainSelector("Polygon Amoy");
    console.log(`🎯 Testing fee estimation to Polygon Amoy (${destinationChainSelector})`);
    
    // Encode receiver address (32 bytes, left-padded)
    const receiverBytes = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address"], 
      [userAddress]
    );
    
    // Create CCIP message with CCIP-BnM token
    const tokenAmount = ethers.parseEther("1.0"); // 1 CCIP-BnM token
    const message = {
      receiver: receiverBytes,
      data: "0x",
      tokenAmounts: [{
        token: ccipBnmAddress,
        amount: tokenAmount
      }],
      feeToken: "0x0000000000000000000000000000000000000000", // Pay with native ETH
      extraArgs: "0x" // Empty extraArgs
    };
    
    console.log("📊 Estimating bridge fee with CCIP-BnM token...");
    const fee = await router.getFee(destinationChainSelector, message);
    console.log(`💸 Estimated Fee: ${ethers.formatEther(fee)} ETH`);
    
    console.log("✅ CCIP-BnM token test completed successfully!");
    console.log("🎉 Bridge fee estimation works with CCIP-whitelisted token!");
    
  } catch (error) {
    console.error("❌ Error testing CCIP-BnM token:", error.message);
    
    // If it's a revert error, try to decode it
    if (error.data) {
      console.error("📋 Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
