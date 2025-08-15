const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Diagnosing bridge contract issues...\n");

  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Contract addresses from latest deployment
  const BRIDGE_ADDRESS = "0xbF830afacF7e7b23B3Ce8E07A46674A63a2f2345";
  const ZYL_TOKEN_ADDRESS = "0xd53E07D67d30cE5562e8C0aE6e569b4FAf830A45";
  const CCIP_BNM_ADDRESS = "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D";
  const POLYGON_AMOY_SELECTOR = "16281711391670634445";

  // Get contract instances
  const bridge = await ethers.getContractAt("MultiTokenBridge", BRIDGE_ADDRESS);
  const ccipBnm = await ethers.getContractAt("IERC20", CCIP_BNM_ADDRESS);

  console.log("=== 1. Contract Configuration Check ===");
  
  // Check if CCIP-BnM is supported
  try {
    const tokenConfig = await bridge.tokenConfigs(CCIP_BNM_ADDRESS);
    console.log("CCIP-BnM token config:");
    console.log("  - Supported:", tokenConfig.isSupported);
    console.log("  - Min amount:", ethers.formatEther(tokenConfig.minAmount));
    console.log("  - Max amount:", ethers.formatEther(tokenConfig.maxAmount));
  } catch (error) {
    console.error("❌ Failed to get CCIP-BnM config:", error.message);
  }

  // Check if Polygon Amoy is supported
  try {
    const chainSupported = await bridge.supportedChains(POLYGON_AMOY_SELECTOR);
    console.log("Polygon Amoy chain supported:", chainSupported);
  } catch (error) {
    console.error("❌ Failed to check chain support:", error.message);
  }

  // Check if bridge is paused
  try {
    const isPaused = await bridge.isPaused();
    console.log("Bridge paused:", isPaused);
  } catch (error) {
    console.error("❌ Failed to check pause status:", error.message);
  }

  console.log("\n=== 2. Token Balance & Allowance Check ===");
  
  // Check user's CCIP-BnM balance
  try {
    const balance = await ccipBnm.balanceOf(signer.address);
    console.log("User CCIP-BnM balance:", ethers.formatEther(balance));
    
    if (balance === 0n) {
      console.log("⚠️  User has no CCIP-BnM tokens. Attempting to mint...");
      try {
        const mintTx = await ccipBnm.drip(signer.address);
        await mintTx.wait();
        console.log("✅ Minted CCIP-BnM tokens");
        
        const newBalance = await ccipBnm.balanceOf(signer.address);
        console.log("New balance:", ethers.formatEther(newBalance));
      } catch (mintError) {
        console.error("❌ Failed to mint CCIP-BnM:", mintError.message);
      }
    }
  } catch (error) {
    console.error("❌ Failed to check balance:", error.message);
  }

  // Check allowance
  try {
    const allowance = await ccipBnm.allowance(signer.address, BRIDGE_ADDRESS);
    console.log("Current allowance:", ethers.formatEther(allowance));
  } catch (error) {
    console.error("❌ Failed to check allowance:", error.message);
  }

  console.log("\n=== 3. Fee Estimation Test ===");
  
  // Test fee estimation
  try {
    const testAmount = ethers.parseEther("1");
    const testReceiver = signer.address;
    
    console.log("Testing fee estimation for:");
    console.log("  - Amount:", ethers.formatEther(testAmount));
    console.log("  - Receiver:", testReceiver);
    console.log("  - Destination:", POLYGON_AMOY_SELECTOR);
    
    const fee = await bridge.estimateBridgeFee(
      POLYGON_AMOY_SELECTOR,
      testReceiver,
      CCIP_BNM_ADDRESS,
      testAmount
    );
    
    console.log("✅ Estimated fee:", ethers.formatEther(fee), "ETH");
  } catch (error) {
    console.error("❌ Fee estimation failed:", error.message);
    console.error("Full error:", error);
  }

  console.log("\n=== 4. Approval Test ===");
  
  // Test approval
  try {
    const approveAmount = ethers.parseEther("1");
    console.log("Testing approval for:", ethers.formatEther(approveAmount));
    
    const approveTx = await ccipBnm.approve(BRIDGE_ADDRESS, approveAmount);
    await approveTx.wait();
    console.log("✅ Approval successful");
    
    const newAllowance = await ccipBnm.allowance(signer.address, BRIDGE_ADDRESS);
    console.log("New allowance:", ethers.formatEther(newAllowance));
  } catch (error) {
    console.error("❌ Approval failed:", error.message);
  }

  console.log("\n=== 5. Bridge Transaction Simulation ===");
  
  // Try to simulate the bridge transaction
  try {
    const bridgeAmount = ethers.parseEther("0.5");
    const receiver = signer.address;
    
    console.log("Simulating bridge transaction:");
    console.log("  - Amount:", ethers.formatEther(bridgeAmount));
    console.log("  - Receiver:", receiver);
    console.log("  - Token:", CCIP_BNM_ADDRESS);
    
    // First get the fee
    const requiredFee = await bridge.estimateBridgeFee(
      POLYGON_AMOY_SELECTOR,
      receiver,
      CCIP_BNM_ADDRESS,
      bridgeAmount
    );
    
    console.log("Required fee:", ethers.formatEther(requiredFee), "ETH");
    
    // Try to call the bridge function (this will revert if there's an issue)
    const gasEstimate = await bridge.bridgeTokens.estimateGas(
      POLYGON_AMOY_SELECTOR,
      receiver,
      CCIP_BNM_ADDRESS,
      bridgeAmount,
      { value: requiredFee }
    );
    
    console.log("✅ Gas estimate successful:", gasEstimate.toString());
    console.log("🎉 Bridge transaction should work!");
    
  } catch (error) {
    console.error("❌ Bridge simulation failed:", error.message);
    
    // Try to decode the revert reason
    if (error.data) {
      try {
        const decodedError = bridge.interface.parseError(error.data);
        console.error("Decoded error:", decodedError.name, decodedError.args);
      } catch (decodeError) {
        console.error("Could not decode error data:", error.data);
      }
    }
  }

  console.log("\n🔍 Diagnosis complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Diagnostic script failed:", error);
    process.exit(1);
  });
