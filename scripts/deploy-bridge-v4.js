const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying ZelionBridgeV3 with increased fee buffer...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy the bridge with upgradeable proxy
  const Bridge = await ethers.getContractFactory("ZelionBridgeV3");
  
  // Arbitrum Sepolia CCIP Router
  const routerAddress = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165";
  
  const bridge = await upgrades.deployProxy(Bridge, [routerAddress], {
    initializer: 'initialize',
    kind: 'uups'
  });
  
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  
  console.log("ZelionBridgeV3 deployed to:", bridgeAddress);
  
  // Configure for ZYL token
  const zylTokenAddress = "0xd53E07D67d30cE5562e8C0aE6e569b4FAf830A45";
  const polygonSelector = "16281711391670634445"; // Polygon Amoy
  
  console.log("\nConfiguring ZYL token...");
  const tx1 = await bridge.configureToken(
    zylTokenAddress,
    true, // isSupported
    true, // isBurnable
    zylTokenAddress, // same token address on destination
    polygonSelector
  );
  await tx1.wait();
  console.log("✅ ZYL token configured");
  
  // Set trusted bridge (using same address for testing)
  console.log("\nSetting trusted bridge...");
  const tx2 = await bridge.setTrustedBridge(polygonSelector, bridgeAddress);
  await tx2.wait();
  console.log("✅ Trusted bridge set");
  
  // Grant bridge role to the bridge contract on ZYL token
  const zylToken = await ethers.getContractAt("ZYLToken", zylTokenAddress);
  const BRIDGE_ROLE = await zylToken.BRIDGE_ROLE();
  
  console.log("\nGranting bridge role...");
  const tx3 = await zylToken.grantRole(BRIDGE_ROLE, bridgeAddress);
  await tx3.wait();
  console.log("✅ Bridge role granted");
  
  // Set higher fee buffer
  console.log("\nSetting fee buffer to 50%...");
  const tx4 = await bridge.setBaseFeeBuffer(50);
  await tx4.wait();
  console.log("✅ Fee buffer set to 50%");
  
  console.log("\n🎉 Deployment complete!");
  console.log("Bridge address:", bridgeAddress);
  console.log("\nUpdate frontend config with this address!");
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "arbitrum-sepolia",
    bridgeAddress: bridgeAddress,
    zylToken: zylTokenAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './deployment-output/bridge-v4-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main().catch(console.error);
