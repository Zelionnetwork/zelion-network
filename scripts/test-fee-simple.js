const { ethers } = require('hardhat');

async function main() {
  console.log('\n========== Testing Bridge Fee Estimation ==========\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Account:', deployer.address);

  // Contract addresses
  const bridgeAddress = '0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4';
  const tokenAddress = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';
  
  console.log('Bridge:', bridgeAddress);
  console.log('Token:', tokenAddress);

  // Get contract instance
  const ZelionBridge = await ethers.getContractFactory('ZelionBridge');
  const bridge = ZelionBridge.attach(bridgeAddress);

  // Test parameters
  const destinationChainSelector = '16281711391670634445'; // Avalanche Fuji
  const amount = ethers.utils.parseEther('1');

  console.log('\n--- Test Parameters ---');
  console.log('Destination Chain Selector:', destinationChainSelector);
  console.log('Amount:', ethers.utils.formatEther(amount), 'ZYL');

  try {
    console.log('\n--- Calling estimateBridgeFee ---');
    const fee = await bridge.estimateBridgeFee(
      destinationChainSelector,
      tokenAddress,
      amount
    );
    console.log('SUCCESS! Fee:', ethers.utils.formatEther(fee), 'ETH');
  } catch (error) {
    console.log('\nERROR calling estimateBridgeFee:');
    console.log('Error message:', error.message);
    if (error.reason) console.log('Reason:', error.reason);
    if (error.data) console.log('Data:', error.data);
  }

  console.log('\n========== Test Complete ==========\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });
