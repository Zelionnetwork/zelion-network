const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Zelion Bridge Complete Deployment ===\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Chainlink CCIP Router address for Arbitrum Sepolia (from official docs)
  const arbitrumSepoliaRouter = ethers.getAddress("0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165");

  try {
    // Deploy ZYLToken
    console.log("1. Deploying ZYLToken...");
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    const zylToken = await ZYLToken.deploy();
    await zylToken.waitForDeployment();
    
    const zylTokenAddress = await zylToken.getAddress();
    console.log("   ✅ ZYLToken deployed to:", zylTokenAddress);

    // Deploy ZelionBridge (without proxy, with direct initialization)
    console.log("\n2. Deploying ZelionBridge...");
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    
    // Deploy the bridge contract
    const zelionBridge = await ZelionBridge.deploy();
    await zelionBridge.waitForDeployment();
    
    const bridgeAddress = await zelionBridge.getAddress();
    console.log("   ✅ ZelionBridge deployed to:", bridgeAddress);
    
    // Initialize the bridge
    console.log("\n3. Initializing ZelionBridge...");
    const initTx = await zelionBridge.initialize(arbitrumSepoliaRouter);
    await initTx.wait();
    console.log("   ✅ ZelionBridge initialized with router:", arbitrumSepoliaRouter);

    // Configure the token for cross-chain bridging
    console.log("\n4. Configuring token for bridging...");
    
    // Grant bridge role to the bridge contract on the token
    const BRIDGE_ROLE = await zylToken.BRIDGE_ROLE();
    const grantRoleTx = await zylToken.grantRole(BRIDGE_ROLE, bridgeAddress);
    await grantRoleTx.wait();
    console.log("   ✅ Granted BRIDGE_ROLE to ZelionBridge contract");

    // Configure token in bridge for Avalanche Fuji (example destination)
    // Avalanche Fuji Chain Selector: 14767482510784806043
    const avalancheFujiSelector = "14767482510784806043";
    const configTx = await zelionBridge.configureToken(
      zylTokenAddress,
      true, // isSupported
      true, // isBurnable
      zylTokenAddress, // destinationToken (same token address on destination)
      avalancheFujiSelector
    );
    await configTx.wait();
    console.log("   ✅ Configured token for Avalanche Fuji bridging");

    console.log("\n=== Deployment Summary ===");
    console.log("Network: Arbitrum Sepolia");
    console.log("ZYLToken Address:", zylTokenAddress);
    console.log("ZelionBridge Address:", bridgeAddress);
    console.log("CCIP Router:", arbitrumSepoliaRouter);
    console.log("Configured for bridging to: Avalanche Fuji");
    
    // Save deployment info
    const deploymentInfo = {
      network: "arbitrum-sepolia",
      chainId: 421614,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        ZYLToken: {
          address: zylTokenAddress,
          deploymentHash: zylToken.deploymentTransaction()?.hash
        },
        ZelionBridge: {
          address: bridgeAddress,
          deploymentHash: zelionBridge.deploymentTransaction()?.hash,
          router: arbitrumSepoliaRouter,
          configuredChains: ["avalanche-fuji"]
        }
      }
    };
    
    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, "arbitrum-sepolia-complete.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    // Save frontend-compatible format
    const frontendDir = path.join(__dirname, "..", "..", "zelion-client", "src", "contracts");
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
    }
    
    const frontendInfo = {
      ZYLToken: {
        address: zylTokenAddress,
        abi: JSON.parse(zylToken.interface.formatJson())
      },
      ZelionBridge: {
        address: bridgeAddress,
        abi: JSON.parse(zelionBridge.interface.formatJson())
      }
    };
    
    fs.writeFileSync(
      path.join(frontendDir, "deployment-info.json"),
      JSON.stringify(frontendInfo, null, 2)
    );
    
    console.log("\n✅ Deployment info saved to:");
    console.log("   - deployments/arbitrum-sepolia-complete.json");
    console.log("   - ../zelion-client/src/contracts/deployment-info.json");
    console.log("\n🎉 Complete deployment successful!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error("Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Deployment script failed:", error);
  process.exitCode = 1;
});
