const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Refilling Faucet on Arbitrum Sepolia Testnet...");
  
  // Get the deployed faucet address
  const FAUCET_ADDRESS = "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0";
  
  // Amount to send: 1 million ETH (in wei) - this is TEST ETH
  const REFILL_AMOUNT = hre.ethers.parseEther("1000000");
  
  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Refilling from account:", deployer.address);
  
  // Check network
  const network = await hre.ethers.provider.getNetwork();
  console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 421614n) {
    throw new Error("Not connected to Arbitrum Sepolia! Please check your network configuration.");
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
    process.exit(1);
  }
  
  // Check current faucet balance
  const faucetBalanceBefore = await hre.ethers.provider.getBalance(FAUCET_ADDRESS);
  console.log("Current faucet balance:", hre.ethers.formatEther(faucetBalanceBefore), "ETH");
  
  // Send ETH to faucet
  console.log("\n📤 Sending", hre.ethers.formatEther(REFILL_AMOUNT), "ETH to faucet...");
  
  const tx = await deployer.sendTransaction({
    to: FAUCET_ADDRESS,
    value: REFILL_AMOUNT
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
