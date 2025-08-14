const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = ethers.utils.getAddress("0x8ca22d90A66c1d9869d844DAe0befE8930af11e5");

  try {
    console.log("Attempting to connect to contract...");
    const token = await ethers.getContractAt("ZYLToken", tokenAddress);
    console.log(`Successfully connected to contract at ${token.address}`);

    console.log("\nFetching token name...");
    const name = await token.name();
    console.log(`Token Name: ${name}`);

    console.log("\nFetching token symbol...");
    const symbol = await token.symbol();
    console.log(`Token Symbol: ${symbol}`);

    console.log("\nConnection test successful!");

  } catch (error) {
    console.error("\n--- DETAILED CONNECTION ERROR ---");
    console.error(error);
    console.error("---------------------------------");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
