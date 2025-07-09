const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🚀 Starting testnet deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");

  // Use dummy addresses for testnet if needed
  const CCIP_ROUTER = "0x0000000000000000000000000000000000000001"; // Placeholder for testnet
  const DEST_CHAIN_SELECTOR = 12532609583862916517n; // uint64 value as BigInt

  // Deploy ZYLToken (constructor needs address)
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy(deployer.address);
  await zylToken.waitForDeployment();
  console.log("✅ ZYLToken deployed to:", await zylToken.getAddress());

  // Deploy CrossChainTransfer (needs router, token, selector)
  const CrossChainTransfer = await ethers.getContractFactory("CrossChainTransfer");
  const crossChainTransfer = await CrossChainTransfer.deploy(
    CCIP_ROUTER,
    await zylToken.getAddress(),
    DEST_CHAIN_SELECTOR
  );
  await crossChainTransfer.waitForDeployment();
  console.log("✅ CrossChainTransfer deployed to:", await crossChainTransfer.getAddress());

  console.log("🎉 Testnet deployment completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
