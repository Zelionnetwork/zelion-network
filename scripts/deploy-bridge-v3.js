const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ZelionBridgeV3 with account:", deployer.address);

  // Arbitrum Sepolia CCIP Router
  const routerAddress = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165";
  
  // Deploy new bridge
  const ZelionBridgeV3 = await ethers.getContractFactory("ZelionBridgeV3");
  console.log("Deploying ZelionBridgeV3 proxy...");
  
  const bridgeV3 = await upgrades.deployProxy(ZelionBridgeV3, [routerAddress], {
    initializer: "initialize",
    kind: "transparent",
  });
  
  await bridgeV3.waitForDeployment();
  const bridgeV3Address = await bridgeV3.getAddress();
  console.log("ZelionBridgeV3 deployed to:", bridgeV3Address);

  // Configure ZYL token
  const zylTokenAddress = "0xd53E07D67d30cE5562e8C0aE6e569b4FAf830A45";
  console.log("\nConfiguring ZYL token...");
  
  // Configure for Polygon Amoy
  await bridgeV3.configureToken(
    zylTokenAddress,
    true, // isSupported
    true, // isBurnable
    zylTokenAddress, // destinationToken (same address)
    "16281711391670634445" // Polygon Amoy selector
  );
  console.log("✅ Configured for Polygon Amoy");

  // Grant bridge role to new bridge
  const zylToken = await ethers.getContractAt("ZYLToken", zylTokenAddress);
  const BRIDGE_ROLE = await zylToken.BRIDGE_ROLE();
  
  await zylToken.grantRole(BRIDGE_ROLE, bridgeV3Address);
  console.log("✅ Granted BRIDGE_ROLE to new bridge");

  // Save deployment info
  const deploymentInfo = {
    network: "arbitrum-sepolia",
    bridgeV3Address: bridgeV3Address,
    routerAddress: routerAddress,
    zylTokenAddress: zylTokenAddress,
    deployedAt: new Date().toISOString(),
    supportedChains: {
      polygonAmoy: "16281711391670634445"
    }
  };

  const outputPath = path.join(__dirname, "..", "deployment-output", "bridge-v3-deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Saved deployment info to:", outputPath);

  console.log("\n🎉 ZelionBridgeV3 deployment complete!");
  console.log("Next steps:");
  console.log("1. Deploy matching bridge on Polygon Amoy");
  console.log("2. Set trusted bridges on both chains");
  console.log("3. Update frontend to use new bridge address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
