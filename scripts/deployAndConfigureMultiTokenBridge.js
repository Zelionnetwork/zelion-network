const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Configuration values are hardcoded here for clarity and simplicity.
const CONFIG = {
  'arbitrum-sepolia': {
    router: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    ccipBnm: '0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D'
  },
  'polygon-amoy': {
    chainSelector: '16281711391670634445'
  },
  'avalanche-fuji': {
    chainSelector: '14767482510784806043'
  }
};

async function main() {
  console.log("🚀 Deploying and configuring MultiTokenBridge contract...");

  const [signer] = await ethers.getSigners();
  console.log("Deploying with account:", signer.address);

  // 1. Deploy ZYLToken
  console.log("\n1. Deploying ZYLToken...");
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylTokenAddress = await zylToken.getAddress();
  console.log("✅ ZYLToken deployed to:", zylTokenAddress);

  // 2. Deploy MultiTokenBridge
  console.log("\n2. Deploying MultiTokenBridge...");
  const routerAddress = CONFIG['arbitrum-sepolia'].router;
  const MultiTokenBridge = await ethers.getContractFactory("MultiTokenBridge");
  const multiTokenBridge = await MultiTokenBridge.deploy(routerAddress);
  await multiTokenBridge.waitForDeployment();
  const bridgeAddress = await multiTokenBridge.getAddress();
  console.log("✅ MultiTokenBridge deployed to:", bridgeAddress);

  // 3. Configure Tokens
  console.log("\n3. Configuring token support...");
  const zylConfig = { isSupported: true, min: ethers.parseUnits("1", 18), max: ethers.parseUnits("10000", 18) };
  const ccipBnmConfig = { isSupported: true, min: ethers.parseUnits("0.1", 18), max: ethers.parseUnits("1000", 18) };

  console.log(`   - Configuring ZYLToken (${zylTokenAddress})...`);
  let tx = await multiTokenBridge.setTokenConfig(zylTokenAddress, zylConfig.isSupported, zylConfig.min, zylConfig.max);
  await tx.wait();
  console.log("   - ZYLToken configured.");

  const ccipBnmAddress = CONFIG['arbitrum-sepolia'].ccipBnm;
  console.log(`   - Configuring CCIP-BnM (${ccipBnmAddress})...`);
  tx = await multiTokenBridge.setTokenConfig(ccipBnmAddress, ccipBnmConfig.isSupported, ccipBnmConfig.min, ccipBnmConfig.max);
  await tx.wait();
  console.log("   - CCIP-BnM configured.");

  // 4. Configure Chains
  console.log("\n4. Configuring chain support...");
  const supportedChains = ['polygon-amoy', 'avalanche-fuji'];
  for (const chainName of supportedChains) {
      const chainSelector = CONFIG[chainName].chainSelector;
      console.log(`   - Enabling chain: ${chainName} (${chainSelector})`);
      tx = await multiTokenBridge.setChainSupport(chainSelector, true);
      await tx.wait();
  }
  console.log("✅ All chains configured.");

  console.log("\n🎉 Deployment and configuration complete!");
  console.log("   - ZYLToken Address:", zylTokenAddress);
  console.log("   - Bridge Address:", bridgeAddress);
    // 5. Save deployment information
  console.log("\n5. Saving deployment information...");
  const deploymentInfo = {
    network: 'arbitrum-sepolia',
    zylTokenAddress: zylTokenAddress,
    bridgeAddress: bridgeAddress,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployment-output');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFilePath = path.join(deploymentsDir, 'multi-token-deployment.json');
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentFilePath}`);


  console.log("\nACTION REQUIRED: Update your frontend .env file with these new addresses.");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
