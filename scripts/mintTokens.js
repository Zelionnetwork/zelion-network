const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenAddress = ethers.utils.getAddress("0x8ca22d90A66c1d9869d844DAe0befE8930af11e5");
  const recipientAddress = ethers.utils.getAddress("0x07B2CfBe1bd51325a8bFbE9399AAB494420111E1");
  const yourAddress = deployer.address;

  console.log(`Using deployer wallet: ${yourAddress}`);

  const token = await ethers.getContractAt("ZYLToken", tokenAddress);
  console.log(`Connected to ZYLToken at: ${token.address}`);

  // 1. Confirm Roles & Pause State
  console.log("\n1. Checking roles and contract state...");
  const ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  const BRIDGE_ROLE = await token.BRIDGE_ROLE();

  const hasAdminRole = await token.hasRole(ADMIN_ROLE, yourAddress);
  const hasBridgeRole = await token.hasRole(BRIDGE_ROLE, yourAddress);
  const isPaused = await token.paused();

  console.log(`  - Deployer has ADMIN_ROLE: ${hasAdminRole}`);
  console.log(`  - Deployer has BRIDGE_ROLE: ${hasBridgeRole}`);
  console.log(`  - Contract is paused: ${isPaused}`);

  if (!hasBridgeRole) {
    console.log("\nGranting BRIDGE_ROLE to deployer...");
    const grantTx = await token.grantRole(BRIDGE_ROLE, yourAddress);
    await grantTx.wait();
    console.log(`BRIDGE_ROLE granted. TX Hash: ${grantTx.hash}`);
  }

  if (isPaused) {
    console.log("\nContract is paused. Unpausing...");
    const unpauseTx = await token.unpause();
    await unpauseTx.wait();
    console.log(`Contract unpaused. TX Hash: ${unpauseTx.hash}`);
  }

  // 2. Mint Directly to Recipient's Wallet
  console.log(`\n2. Minting tokens to ${recipientAddress}...`);
  const amount = ethers.utils.parseUnits("1000", 18);

  try {
    console.log(`Attempting to mint ${ethers.utils.formatUnits(amount, 18)} ZYL to ${recipientAddress}...`);
    const mintTx = await token.mint(recipientAddress, amount);
    console.log(`  - Mint transaction sent. Hash: ${mintTx.hash}`);
    const receipt = await mintTx.wait();
    console.log("  - Mint transaction confirmed.");
    console.log(`  - Gas used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error("\n--- DETAILED MINTING ERROR ---");
    console.error(`Error Message: ${error.message}`);
    if (error.reason) {
        console.error(`Error Reason: ${error.reason}`);
    }
    if (error.transaction) {
        console.error("Transaction Details:", error.transaction);
    }
    if (error.receipt) {
        console.error("Transaction Receipt:", error.receipt);
    }
    console.error("---------------------------------");
    console.log("\nPlease check contract state, roles, and supply limits based on the detailed error above.");
    return;
  }

  // 4. Verification
  console.log("\n4. Verifying balance...");
  const balance = await token.balanceOf(recipientAddress);
  console.log(`  - Balance of ${recipientAddress}: ${ethers.utils.formatUnits(balance, 18)} ZYL`);

  console.log("\nProcess complete. Please check Arbiscan Sepolia for the transfer event.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
