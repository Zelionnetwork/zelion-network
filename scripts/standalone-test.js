const { ethers } = require('ethers');
require('dotenv').config();

// ABI for the functions we need
const BRIDGE_ABI = [
  "function tokenConfigs(address) view returns (bool isSupported, bool isBurnable)",
  "function configureToken(address token, bool isSupported, bool isBurnable, address destinationToken, uint64 destinationChainSelector)",
  "function estimateBridgeFee(uint64 destinationChainSelector, address token, uint256 amount) view returns (uint256)"
];

async function main() {
  console.log('\n=== Standalone Token Config Test ===\n');
  
  // Setup provider and signer
  const provider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Connected to:', process.env.ARBITRUM_SEPOLIA_RPC_URL);
  console.log('Signer address:', signer.address);
  
  // Contract addresses
  const bridgeAddress = '0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4';
  const tokenAddress = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';
  
  // Create contract instance
  const bridge = new ethers.Contract(bridgeAddress, BRIDGE_ABI, signer);
  
  try {
    // Check token configuration
    console.log('\n1. Checking token configuration...');
    const config = await bridge.tokenConfigs(tokenAddress);
    console.log('   isSupported:', config.isSupported);
    console.log('   isBurnable:', config.isBurnable);
    
    if (!config.isSupported) {
      console.log('\n2. Token not configured. Configuring now...');
      const tx = await bridge.configureToken(
        tokenAddress,
        true, // isSupported
        true, // isBurnable
        tokenAddress, // destinationToken
        "3478487238524512106" // Arbitrum Sepolia chain selector
      );
      console.log('   Transaction sent:', tx.hash);
      console.log('   Waiting for confirmation...');
      await tx.wait();
      console.log('   ✅ Token configured successfully!');
      
      // Re-check configuration
      const newConfig = await bridge.tokenConfigs(tokenAddress);
      console.log('\n3. New configuration:');
      console.log('   isSupported:', newConfig.isSupported);
      console.log('   isBurnable:', newConfig.isBurnable);
    } else {
      console.log('   ✅ Token is already configured');
    }
    
    // Test fee estimation
    console.log('\n4. Testing fee estimation...');
    const destinationChain = "16281711391670634445"; // Avalanche Fuji
    const amount = ethers.utils.parseEther("1");
    
    console.log('   Destination chain:', destinationChain);
    console.log('   Amount: 1 ZYL');
    
    const fee = await bridge.estimateBridgeFee(
      destinationChain,
      tokenAddress,
      amount
    );
    
    console.log('   ✅ Fee estimation successful!');
    console.log('   Estimated fee:', ethers.utils.formatEther(fee), 'ETH');
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Message:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    if (error.code) console.error('Code:', error.code);
    if (error.data) console.error('Data:', error.data);
  }
  
  console.log('\n=== Test Complete ===\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
