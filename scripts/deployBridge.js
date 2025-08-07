const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

// Chain IDs and Selectors
const CHAINS = {
  421614: { // Arbitrum Sepolia
    name: "arbitrumSepolia",
    selector: 3478487238524512106, // CCIP chain selector
    router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165"
  },
  80002: { // Polygon Amoy
    name: "polygonAmoy",
    selector: 16281711391670634445,
    router: "0x70499c328e1E2a3c41108bd3730F6670a44595D1"
  },
  42161: { // Arbitrum One
    name: "arbitrumOne",
    selector: 4949039107694359620,
    router: "0xE561d5E02207fb5eB32cca20a699E0d8919a1476"
  },
  56: { // BNB Chain
    name: "bnb",
    selector: 11344663589394136015,
    router: "0xE1053aE1857476f36A3C62580FF9b016E8EE8F6f"
  }
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy token contracts on all chains
  const Token = await ethers.getContractFactory("ZYLToken");
  
  // Deploy bridges on all chains
  for (const [chainId, config] of Object.entries(CHAINS)) {
    // Switch to target chain
    await hre.changeNetwork(config.name);
    
    // Deploy token
    const token = await Token.deploy();
    await token.deployed();
    console.log(`${config.name} Token deployed to: ${token.address}`);
    
    // Deploy bridge
    const Bridge = await ethers.getContractFactory("ZelionBridge");
    const bridge = await upgrades.deployProxy(Bridge, [config.router]);
    await bridge.deployed();
    console.log(`${config.name} Bridge deployed to: ${bridge.address}`);
    
    // Initialize bridge
    await bridge.initialize(config.router);
    
    // Configure token on bridge
    await bridge.configureToken(
      token.address,
      true,   // isSupported
      true,   // isBurnable
      token.address,
      config.selector
    );
    
    // Set chain gas limit
    await bridge.setChainGasLimit(config.selector, 250_000);
    
    // Grant bridge minting/burning rights
    await token.grantRole(await token.MINTER_ROLE(), bridge.address);
    await token.grantRole(await token.BURNER_ROLE(), bridge.address);
    
    // Save addresses for cross-configuration
    config.token = token.address;
    config.bridge = bridge.address;
  }

  // Configure trusted bridges between chains
  for (const [srcChainId, srcConfig] of Object.entries(CHAINS)) {
    for (const [destChainId, destConfig] of Object.entries(CHAINS)) {
      if (srcChainId !== destChainId) {
        await hre.changeNetwork(srcConfig.name);
        const srcBridge = await ethers.getContractAt("ZelionBridge", srcConfig.bridge);
        
        await srcBridge.setTrustedBridge(
          destConfig.selector,
          destConfig.bridge
        );
        
        console.log(`Linked ${srcConfig.name} -> ${destConfig.name}`);
      }
    }
  }

  console.log("Deployment and configuration complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
