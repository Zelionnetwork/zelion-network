const { ethers } = require('hardhat');

async function main() {
  console.log('\n========== Checking and Fixing Token Configuration ==========\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  // Contract addresses
  const bridgeAddress = '0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4';
  const tokenAddress = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';
  
  console.log('Bridge Contract:', bridgeAddress);
  console.log('Token Contract:', tokenAddress);

  // Get contract instance
  const ZelionBridge = await ethers.getContractFactory('ZelionBridge');
  const bridge = ZelionBridge.attach(bridgeAddress);

  // Check current token configuration
  console.log('\n--- Checking Current Token Configuration ---');
  try {
    const tokenConfig = await bridge.tokenConfigs(tokenAddress);
    console.log('Token Config:');
    console.log('  isSupported:', tokenConfig.isSupported);
    console.log('  isBurnable:', tokenConfig.isBurnable);
    
    if (!tokenConfig.isSupported) {
      console.log('\n⚠️  Token is NOT configured! Configuring now...');
      
      // Configure the token for Arbitrum Sepolia (source chain)
      const configTx = await bridge.configureToken(
        tokenAddress,
        true, // isSupported
        true, // isBurnable (true on source chain)
        tokenAddress, // destinationToken (same address for now)
        "3478487238524512106" // Arbitrum Sepolia chain selector
      );
      
      console.log('Waiting for transaction confirmation...');
      await configTx.wait();
      console.log('✅ Token configured successfully!');
      
      // Verify configuration
      const newConfig = await bridge.tokenConfigs(tokenAddress);
      console.log('\nNew Token Config:');
      console.log('  isSupported:', newConfig.isSupported);
      console.log('  isBurnable:', newConfig.isBurnable);
    } else {
      console.log('✅ Token is already configured!');
    }
    
    // Now test fee estimation
    console.log('\n--- Testing Fee Estimation ---');
    const destinationChainSelector = '16281711391670634445'; // Avalanche Fuji
    const amount = ethers.utils.parseEther('1');
    
    console.log('Destination Chain Selector:', destinationChainSelector);
    console.log('Amount:', ethers.utils.formatEther(amount), 'ZYL');
    
    const fee = await bridge.estimateBridgeFee(
      destinationChainSelector,
      tokenAddress,
      amount
    );
    console.log('✅ Fee Estimation Success!');
    console.log('Estimated Fee:', ethers.utils.formatEther(fee), 'ETH');
    
  } catch (error) {
    console.log('\n❌ Error:');
    console.log('Message:', error.message);
    if (error.reason) console.log('Reason:', error.reason);
    if (error.data) console.log('Data:', error.data);
  }

  console.log('\n========== Complete ==========\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });
