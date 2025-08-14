const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    console.error("Error: No deployer account found. Please ensure PRIVATE_KEY is set in your .env file.");
    process.exit(1);
  }

  console.log("Deploying contracts with the account:", deployer.address);

  // --- Deploy ZYLToken ---
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const zylToken = await ZYLToken.deploy();
  await zylToken.waitForDeployment();
  const zylTokenAddress = await zylToken.getAddress();
  console.log("ZYLToken deployed to:", zylTokenAddress);

  // --- Deploy ZelionBridge ---
  const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
  const arbitrumSepoliaRouter = "0x2a9C5afB0d0e42Ab2B315a2e332e2aD555845802"; // Chainlink CCIP Router on Arbitrum Sepolia
  
  console.log("Deploying ZelionBridge proxy...");
  const bridgeProxy = await upgrades.deployProxy(ZelionBridge, [arbitrumSepoliaRouter], {
    initializer: "initialize",
    kind: "transparent",
  });
  await bridgeProxy.waitForDeployment();
  const bridgeProxyAddress = await bridgeProxy.getAddress();
  console.log("ZelionBridge proxy deployed to:", bridgeProxyAddress);

  // --- Save Frontend Files ---
  saveFrontendFiles({
    ZYLToken: zylToken,
    ZelionBridge: { address: bridgeProxyAddress },
  });

  console.log("\nDeployment finished successfully.");
}

function saveFrontendFiles(contracts) {
  const contractsDir = path.join(__dirname, "..", "..", "zelion-client", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deploymentInfo = {
    ZYLToken: {
      address: contracts.ZYLToken.address,
      abi: JSON.parse(contracts.ZYLToken.interface.formatJson()),
    },
    ZelionBridge: {
        address: contracts.ZelionBridge.address,
        abi: require('../artifacts/contracts/ZelionBridge.sol/ZelionBridge.json').abi
    }
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nSaved deployment info to frontend.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
