const { ethers } = require("hardhat");

async function main() {
  const bridgeV3Address = "0xfB89C3Ea94A6750446E394110334Fb6a8B3a7f61";
  
  const bridge = await ethers.getContractAt("ZelionBridgeV3", bridgeV3Address);
  
  console.log("Setting higher fee buffer...");
  
  // Increase fee buffer to 50% to ensure enough fee is sent
  const tx = await bridge.setBaseFeeBuffer(50);
  await tx.wait();
  
  console.log("✅ Fee buffer increased to 50%");
  
  // Verify the new buffer
  const newBuffer = await bridge.baseFeeBuffer();
  console.log("New fee buffer:", newBuffer.toString() + "%");
}

main().catch(console.error);
