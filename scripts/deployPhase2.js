const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Deploy or upgrade bridge
  const BridgeV2 = await ethers.getContractFactory("BridgeV2");
  const bridge = await upgrades.upgradeProxy("0x...BRIDGE_ADDRESS...", BridgeV2);
  await bridge.deployed();
  
  console.log("Bridge upgraded to:", bridge.address);
  
  // Configure tokens
  const tokens = [
    {
      address: "0x...ZYL_ETHEREUM...",
      isBurnable: true,
      destToken: "0x...ZYL_ARBITRUM...",
      chainSelector: 500 // Arbitrum chain selector
    },
    {
      address: "0x...USDC_ETHEREUM...",
      isBurnable: false,
      destToken: "0x...USDC_ARBITRUM...",
      chainSelector: 500
    }
  ];
  
  for (const token of tokens) {
    await bridge.configureToken(
      token.address,
      true,
      token.isBurnable,
      token.destToken,
      token.chainSelector
    );
  }
  
  // Set gas limits
  await bridge.setChainGasLimit(500, 250_000); // Arbitrum
  await bridge.setChainGasLimit(1, 300_000);   // Ethereum
  await bridge.setFeeBuffer(15); // 15% buffer
  
  console.log("Bridge configuration complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
