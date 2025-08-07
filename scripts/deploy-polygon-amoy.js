// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy ZYLToken
  console.log("\nDeploying ZYLToken...");
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const token = await ZYLToken.deploy();
  await token.deployed();
  console.log("ZYLToken deployed to:", token.address);

  // Deploy ZelionBridge
  console.log("\nDeploying ZelionBridge...");
  const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
  // Use the actual CCIP router address for Polygon Amoy
  const routerAddress = "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2"; // Polygon Amoy CCIP router
  const bridge = await upgrades.deployProxy(ZelionBridge, [routerAddress]);
  await bridge.deployed();
  console.log("ZelionBridge deployed to:", bridge.address);
  console.log("ZelionBridge implementation deployed to:", await upgrades.erc1967.getImplementationAddress(bridge.address));
  console.log("ZelionBridge admin proxy deployed to:", await upgrades.erc1967.getAdminAddress(bridge.address));

  // Configure token in bridge
  console.log("\nConfiguring ZYL token in bridge...");
  const configureTx = await bridge.configureToken(
    token.address,
    true,  // isSupported
    true,  // isBurnable
    token.address,  // destToken (same for same-chain)
    0       // destChain (0 for same-chain)
  );
  await configureTx.wait();
  console.log("Token configured in bridge");

  // Grant BRIDGE_ROLE to the bridge contract
  console.log("\nGranting BRIDGE_ROLE to bridge contract...");
  const BRIDGE_ROLE = await token.BRIDGE_ROLE();
  const grantRoleTx = await token.grantRole(BRIDGE_ROLE, bridge.address);
  await grantRoleTx.wait();
  console.log("BRIDGE_ROLE granted to bridge contract");

  // Verify deployment
  console.log("\nVerifying deployment...");
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenSupply = await token.totalSupply();
  console.log("Token name:", tokenName);
  console.log("Token symbol:", tokenSymbol);
  console.log("Token supply:", ethers.utils.formatEther(tokenSupply));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    token: {
      address: token.address,
      name: tokenName,
      symbol: tokenSymbol
    },
    bridge: {
      address: bridge.address,
      implementation: await upgrades.erc1967.getImplementationAddress(bridge.address),
      admin: await upgrades.erc1967.getAdminAddress(bridge.address),
      router: routerAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentPath = `./deployments/${network.name}.json`;
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to ${deploymentPath}`);

  console.log("\nDeployment completed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
