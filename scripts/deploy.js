const { ethers, network } = require("hardhat");
const fs = require("fs");

async function main() {
  // 1. Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. Deploy ZYLToken
  console.log("\nDeploying ZYLToken...");
  const ZYLToken = await ethers.getContractFactory("ZYLToken");
  const token = await ZYLToken.deploy();
  await token.deployed(); // Wait for the deployment to be mined

  console.log("✅ ZYLToken deployed to:", token.address);

  // 3. Save deployment information
  const deploymentInfo = {
    network: network.name,
    token: {
      address: token.address,
      name: await token.name(),
      symbol: await token.symbol(),
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentPath = `${deploymentsDir}/${network.name}.json`;
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\nDeployment info saved to ${deploymentPath}`);
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
