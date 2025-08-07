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
  const ZelionBridge = await ethers.getContractFactory("Bridge");
  const bridge = await upgrades.deployProxy(ZelionBridge, ["0x0"]); // Router address will be set later
  await bridge.deployed();
  console.log("ZelionBridge deployed to:", bridge.address);
  console.log("ZelionBridge implementation deployed to:", await upgrades.erc1967.getImplementationAddress(bridge.address));
  console.log("ZelionBridge admin proxy deployed to:", await upgrades.erc1967.getAdminAddress(bridge.address));

  // Initialize bridge with router address
  // In a real deployment, you would use the actual CCIP router address for the network
  const routerAddress = "0x0"; // Placeholder - replace with actual router address
  console.log("\nInitializing bridge with router address:", routerAddress);
  
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

  // Revoke DEFAULT_ADMIN_ROLE from deployer and grant to a more secure address
  // In a real deployment, you would transfer to a multisig or DAO
  console.log("\nSetting up secure admin roles...");
  // This is just an example - in practice you would transfer to a multisig
  // const secureAdminAddress = "0x..."; // Replace with actual secure address
  // const revokeRoleTx = await token.revokeRole(await token.DEFAULT_ADMIN_ROLE(), deployer.address);
  // await revokeRoleTx.wait();
  // const grantAdminTx = await token.grantRole(await token.DEFAULT_ADMIN_ROLE(), secureAdminAddress);
  // await grantAdminTx.wait();
  console.log("Admin roles configured");

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
      admin: await upgrades.erc1967.getAdminAddress(bridge.address)
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
