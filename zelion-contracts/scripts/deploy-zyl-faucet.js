const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying ZYL Faucet to Arbitrum Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // ZYL Token address (corrected address)
  const ZYL_TOKEN = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // Deploy ZYLFaucet
  console.log("Deploying ZYLFaucet...");
  const ZYLFaucet = await hre.ethers.getContractFactory("ZYLFaucet");
  const faucet = await ZYLFaucet.deploy(ZYL_TOKEN);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ ZYLFaucet deployed to:", faucetAddress);
  
  // Fund the faucet with 1M ZYL tokens
  console.log("\nFunding faucet with ZYL tokens...");
  const zylToken = await hre.ethers.getContractAt("ZYLToken", ZYL_TOKEN);
  
  try {
    // First mint tokens to deployer
    console.log("Minting 1M ZYL to deployer...");
    const mintTx = await zylToken.mint(deployer.address, hre.ethers.parseEther("1000000"));
    await mintTx.wait();
    console.log("✅ Minted 1,000,000 ZYL");
    
    // Approve faucet to spend tokens
    console.log("Approving faucet to spend ZYL...");
    const approveTx = await zylToken.approve(faucetAddress, hre.ethers.parseEther("1000000"));
    await approveTx.wait();
    console.log("✅ Approved");
    
    // Fund the faucet
    console.log("Funding faucet...");
    const fundTx = await faucet.fundFaucet(hre.ethers.parseEther("1000000"));
    await fundTx.wait();
    console.log("✅ Funded faucet with 1,000,000 ZYL");
  } catch (error) {
    console.log("⚠️ Could not mint/fund (may not be token owner)");
    console.log("Alternative: Directly mint to faucet if you're the token owner");
    
    try {
      const mintDirectTx = await zylToken.mint(faucetAddress, hre.ethers.parseEther("1000000"));
      await mintDirectTx.wait();
      console.log("✅ Directly minted 1,000,000 ZYL to faucet");
    } catch (e) {
      console.log("❌ Could not mint tokens. Please manually fund the faucet.");
    }
  }
  
  // Check faucet balance
  const faucetBalance = await faucet.getFaucetBalance();
  console.log("\nFaucet balance:", hre.ethers.formatEther(faucetBalance), "ZYL");
  
  // Save deployment
  const deployment = {
    network: "arbitrum-sepolia",
    chainId: 421614,
    contracts: {
      ZYLToken: ZYL_TOKEN,
      ZYLFaucet: faucetAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    faucetConfig: {
      requestAmount: "100 ZYL",
      cooldownTime: "24 hours",
      balance: hre.ethers.formatEther(faucetBalance) + " ZYL"
    }
  };
  
  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, "zyl-faucet-deployment.json"),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log("\n========================================");
  console.log("🎉 ZYL FAUCET DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("ZYL Token:   ", ZYL_TOKEN);
  console.log("ZYL Faucet:  ", faucetAddress);
  console.log("----------------------------------------");
  console.log("Request Amount: 100 ZYL");
  console.log("Cooldown Time:  24 hours");
  console.log("Faucet Balance:", hre.ethers.formatEther(faucetBalance), "ZYL");
  console.log("========================================");
  console.log("\nUpdate frontend with new faucet address!");
  
  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
