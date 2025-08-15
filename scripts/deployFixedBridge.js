const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying ZelionBridgeFixed contract...");

  const [signer] = await ethers.getSigners();
  console.log("Deploying with account:", signer.address);

  // Arbitrum Sepolia addresses (confirmed from official CCIP docs)
  const ROUTER_ADDRESS = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165";
  const CCIP_BNM_ADDRESS = "0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D";

  console.log("Using router:", ROUTER_ADDRESS);
  console.log("Using CCIP-BnM:", CCIP_BNM_ADDRESS);

  // Deploy the fixed bridge contract
  const ZelionBridgeFixed = await ethers.getContractFactory("ZelionBridgeFixed");
  const bridge = await ZelionBridgeFixed.deploy(ROUTER_ADDRESS, CCIP_BNM_ADDRESS);
  await bridge.waitForDeployment();
  
  const bridgeAddress = await bridge.getAddress();
  console.log("✅ ZelionBridgeFixed deployed to:", bridgeAddress);

  // Verify chain support is enabled
  const polygonSupported = await bridge.supportedChains("16281711391670634445");
  const fujiSupported = await bridge.supportedChains("14767482510784806043");
  
  console.log("Polygon Amoy supported:", polygonSupported);
  console.log("Avalanche Fuji supported:", fujiSupported);

  // Save deployment info
  const deploymentInfo = {
    network: 'arbitrum-sepolia',
    bridgeAddress: bridgeAddress,
    routerAddress: ROUTER_ADDRESS,
    bnmTokenAddress: CCIP_BNM_ADDRESS,
    deployedAt: new Date().toISOString(),
    supportedChains: {
      polygonAmoy: "16281711391670634445",
      avalancheFuji: "14767482510784806043"
    }
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployment-output');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFilePath = path.join(deploymentsDir, 'fixed-bridge-deployment.json');
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentFilePath}`);

  console.log("\n🎉 Deployment complete!");
  console.log("Bridge Address:", bridgeAddress);
  console.log("Router Address:", ROUTER_ADDRESS);
  console.log("CCIP-BnM Address:", CCIP_BNM_ADDRESS);
  console.log("\nNext steps:");
  console.log("1. Update frontend with new bridge address");
  console.log("2. Update frontend ABI");
  console.log("3. Test bridging with CCIP-BnM tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
