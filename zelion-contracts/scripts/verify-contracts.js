const hre = require("hardhat");

async function main() {
  console.log("Verifying contracts on Arbiscan...\n");
  
  const contracts = [
    {
      name: "ZYLToken",
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      constructorArguments: []
    },
    {
      name: "Faucet", 
      address: "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0",
      constructorArguments: []
    },
    {
      name: "SimpleSwap",
      address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      constructorArguments: []
    },
    {
      name: "Staking",
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      constructorArguments: ["0x5FbDB2315678afecb367f032d93F642f64180aa3"]
    }
  ];
  
  for (const contract of contracts) {
    console.log(`Verifying ${contract.name} at ${contract.address}...`);
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArguments,
      });
      console.log(`✅ ${contract.name} verified successfully!\n`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`ℹ️  ${contract.name} is already verified\n`);
      } else {
        console.log(`❌ Error verifying ${contract.name}: ${error.message}\n`);
      }
    }
  }
  
  console.log("Verification process complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
