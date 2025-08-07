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
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ZYLToken
  console.log("\nDeploying ZYLToken...");
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const token = await ZYLToken.deploy();
  await token.waitForDeployment();
  console.log("ZYLToken deployed to:", token.target);

  // Deploy ZelionBridge
  console.log("\nDeploying ZelionBridge...");
  const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
  // Use the actual CCIP router address for Arbitrum Sepolia
  const routerAddress = "0x91a5632431a3191d105924634a770485c55c0e3a"; // Arbitrum Sepolia CCIP router
  const bridgeProxy = await upgrades.deployProxy(ZelionBridge, [routerAddress]);
  await bridgeProxy.waitForDeployment();
  const bridge = ZelionBridge.attach(bridgeProxy.target);
  console.log("ZelionBridge deployed to:", bridge.target);
  console.log("ZelionBridge implementation deployed to:", await upgrades.erc1967.getImplementationAddress(bridge.target));
  console.log("ZelionBridge admin proxy deployed to:", await upgrades.erc1967.getAdminAddress(bridge.target));

  // Configure token in bridge
  console.log("\nConfiguring ZYL token in bridge...");
  const configureTx = await bridge.configureToken(
    token.target,
    true,  // isSupported
    true,  // isBurnable
    token.target,  // destToken (same for same-chain)
    0       // destChain (0 for same-chain)
  );
  await configureTx.wait();
  console.log("Token configured in bridge");

  // Grant BRIDGE_ROLE to the bridge contract
  console.log("\nGranting BRIDGE_ROLE to bridge contract...");
  const BRIDGE_ROLE = await token.BRIDGE_ROLE();
  const grantRoleTx = await token.grantRole(BRIDGE_ROLE, bridge.target);
  await grantRoleTx.wait();
  console.log("BRIDGE_ROLE granted to bridge contract");

  // Verify deployment
  console.log("\nVerifying deployment...");
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenSupply = await token.totalSupply();
  console.log("Token name:", tokenName);
  console.log("Token symbol:", tokenSymbol);
  console.log("Token supply:", ethers.formatEther(tokenSupply));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    token: {
      address: token.target,
      name: tokenName,
      symbol: tokenSymbol
    },
    bridge: {
      address: bridge.target,
      implementation: await upgrades.erc1967.getImplementationAddress(bridge.target),
      admin: await upgrades.erc1967.getAdminAddress(bridge.target),
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
