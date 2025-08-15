const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying MultiTokenBridge contract...");

  // Chainlink Router address for Arbitrum Sepolia
  const ROUTER_ADDRESS = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165";

  // Get the contract factory
  const MultiTokenBridge = await ethers.getContractFactory("MultiTokenBridge");

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Deploying with account:", signer.address);

  try {
    // Deploy the contract
    console.log("\nDeploying contract with router:", ROUTER_ADDRESS);
    const multiTokenBridge = await MultiTokenBridge.deploy(ROUTER_ADDRESS);

    console.log("Transaction sent, waiting for deployment...");
    await multiTokenBridge.waitForDeployment();

    const bridgeAddress = await multiTokenBridge.getAddress();
    console.log("\n✅ MultiTokenBridge deployed successfully!");
    console.log("Contract Address:", bridgeAddress);

    console.log("\n📋 Next Steps:");
    console.log("1. Update your frontend .env file with the new bridge address:");
    console.log(`   NEXT_PUBLIC_BRIDGE_ADDRESS=${bridgeAddress}`);
    console.log("\n2. Run the configuration script to add token support:");
    console.log(`   npx hardhat run scripts/configureNewBridge.js --network arbitrum-sepolia`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.message.includes("insufficient funds")) {
        console.log("💡 Please ensure your deployment account has enough ETH on Arbitrum Sepolia.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
