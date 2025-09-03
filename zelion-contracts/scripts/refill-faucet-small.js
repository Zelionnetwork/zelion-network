const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Refilling Faucet on Arbitrum Sepolia Testnet...");
  
  // Get the deployed faucet address
  const FAUCET_ADDRESS = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  
  // More realistic amount: 0.5 ETH (enough for 5 faucet requests)
  const REFILL_AMOUNT = hre.ethers.parseEther("0.5");
  
  try {
    // Get signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Refilling from account:", deployer.address);
    
    // Check network
    const network = await hre.ethers.provider.getNetwork();
    console.log("Connected to network: Chain ID:", Number(network.chainId));
    
    if (Number(network.chainId) !== 421614) {
      throw new Error("Not connected to Arbitrum Sepolia! Expected chain ID 421614, got " + network.chainId);
    }
    
    // Check deployer balance
    const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(deployerBalance), "ETH");
    
    if (deployerBalance < REFILL_AMOUNT) {
      console.error("\n❌ Insufficient balance!");
      console.error(`Need: ${hre.ethers.formatEther(REFILL_AMOUNT)} ETH`);
      console.error(`Have: ${hre.ethers.formatEther(deployerBalance)} ETH`);
      console.error("\n💡 To get test ETH for Arbitrum Sepolia:");
      console.error("1. Visit: https://faucet.quicknode.com/arbitrum/sepolia");
      console.error("2. Or visit: https://www.alchemy.com/faucets/arbitrum-sepolia");
      console.error("3. Enter your address:", deployer.address);
      console.error("\n⚠️  Note: The current private key in .env is a local test key.");
      console.error("You need to replace it with a private key that has test ETH on Arbitrum Sepolia.");
      console.error("\nTo use your MetaMask wallet:");
      console.error("1. Export your private key from MetaMask (Settings > Security & Privacy > Show Private Keys)");
      console.error("2. Update the PRIVATE_KEY in .env file (without the 0x prefix)");
      process.exit(1);
    }
    
    // Check current faucet balance
    const faucetBalanceBefore = await hre.ethers.provider.getBalance(FAUCET_ADDRESS);
    console.log("Current faucet balance:", hre.ethers.formatEther(faucetBalanceBefore), "ETH");
    
    // Send ETH to faucet
    console.log("\n📤 Sending", hre.ethers.formatEther(REFILL_AMOUNT), "ETH to faucet...");
    
    const tx = await deployer.sendTransaction({
      to: FAUCET_ADDRESS,
      value: REFILL_AMOUNT,
      gasLimit: 50000
    });
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    
    // Check new faucet balance
    const faucetBalanceAfter = await hre.ethers.provider.getBalance(FAUCET_ADDRESS);
    console.log("\n✅ Faucet refilled successfully!");
    console.log("New faucet balance:", hre.ethers.formatEther(faucetBalanceAfter), "ETH");
    
    // Calculate amount added
    const amountAdded = faucetBalanceAfter - faucetBalanceBefore;
    console.log("Amount added:", hre.ethers.formatEther(amountAdded), "ETH");
    
    console.log("\n🎉 Users can now request 0.1 ETH from the faucet!");
    console.log("Faucet has enough for", Math.floor(Number(faucetBalanceAfter) / Number(hre.ethers.parseEther("0.1"))), "requests");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("could not detect network")) {
      console.error("\n⚠️  Network connection issue. Please check:");
      console.error("1. Your internet connection");
      console.error("2. The RPC URL in .env file");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
