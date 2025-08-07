const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Deploy token
  const Token = await ethers.getContractFactory("ZYLToken");
  const token = await Token.deploy();
  await token.deployed();
  
  // Deploy bridge
  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await upgrades.deployProxy(Bridge, []);
  await bridge.deployed();
  
  // Initialize bridge
  await bridge.initialize("0xE561d5E02207fb5eB32cca20a699E0d8919a1476", token.address);
  
  // Configure bridges (example for Ethereum mainnet)
  const chains = [
    { 
      selector: 1, // Ethereum
      source: bridge.address,
      destination: bridge.address 
    },
    { 
      selector: 501, // Zylithium Chain
      source: bridge.address,
      destination: bridge.address 
    }
  ];
  
  await bridge.configureBridges(
    chains.map(c => c.selector),
    chains.map(c => c.source),
    chains.map(c => c.destination)
  );
  
  // Grant BRIDGE_ROLE to bridge (minting is now restricted to BRIDGE_ROLE)
  const BRIDGE_ROLE = await token.BRIDGE_ROLE();
  await token.grantRole(BRIDGE_ROLE, bridge.address);
  
  // Revoke DEFAULT_ADMIN_ROLE for security
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  await token.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  
  console.log("Token deployed to:", token.address);
  console.log("Bridge deployed to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
