const hre = require("hardhat");

async function main() {
  const token = await hre.ethers.getContractAt(
    "ZYLToken", 
    "0x8ca22d90A66c1d9869d844DAe0befE8930af11e5"
  );
  const tx = await token.mint(
    "0x07B2CfBe1bd51325a8bFbE9399AAB494420111E1", 
    hre.ethers.utils.parseUnits("1000", 18)
  );
  console.log("Mint TX:", tx.hash);
  await tx.wait();
  console.log("Done!");
}

main().catch(console.error);