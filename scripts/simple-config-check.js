const { ethers } = require('hardhat');

async function main() {
  try {
    console.log('\n=== Token Config Check ===\n');
    
    const [deployer] = await ethers.getSigners();
    const bridgeAddress = '0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4';
    const tokenAddress = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';
    
    // Get bridge contract
    const bridge = await ethers.getContractAt('ZelionBridge', bridgeAddress);
    
    // Check if token is configured
    console.log('Checking token config...');
    const config = await bridge.tokenConfigs(tokenAddress);
    
    console.log('isSupported:', config.isSupported);
    console.log('isBurnable:', config.isBurnable);
    
    if (!config.isSupported) {
      console.log('\nToken NOT configured. Configuring now...');
      
      // Configure token
      const tx = await bridge.configureToken(
        tokenAddress,
        true, // isSupported
        true, // isBurnable
        tokenAddress, // destinationToken
        "3478487238524512106" // Arbitrum Sepolia selector
      );
      
      console.log('TX Hash:', tx.hash);
      await tx.wait();
      console.log('Token configured!');
    } else {
      console.log('\nToken already configured!');
    }
    
    // Test fee estimation
    console.log('\nTesting fee estimation...');
    const fee = await bridge.estimateBridgeFee(
      "16281711391670634445", // Avalanche Fuji
      tokenAddress,
      ethers.utils.parseEther("1")
    );
    
    console.log('Fee:', ethers.utils.formatEther(fee), 'ETH');
    console.log('\n=== Success ===\n');
    
  } catch (error) {
    console.error('\nERROR:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
  }
}

main().catch(console.error);
