const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n========== Fixing Frontend ABI ==========\n');
  
  // Read the compiled contract ABI
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ZelionBridge.sol/ZelionBridge.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Find the estimateBridgeFee function in the ABI
  const estimateBridgeFeeABI = artifact.abi.find(item => 
    item.type === 'function' && item.name === 'estimateBridgeFee'
  );
  
  if (!estimateBridgeFeeABI) {
    console.error('❌ estimateBridgeFee not found in ABI');
    return;
  }
  
  console.log('Found estimateBridgeFee ABI:');
  console.log(JSON.stringify(estimateBridgeFeeABI, null, 2));
  
  // Update frontend ABI files
  const frontendABIPaths = [
    path.join(__dirname, '../../zelion-site/src/app/abi/ZelionBridgeABI.json'),
    path.join(__dirname, '../../zelion-site/src/contracts/deployment-info.json'),
    path.join(__dirname, '../../zelion-site/public/contracts/deployment-info.json')
  ];
  
  for (const abiPath of frontendABIPaths) {
    if (fs.existsSync(abiPath)) {
      console.log(`\nUpdating: ${path.basename(path.dirname(abiPath))}/${path.basename(abiPath)}`);
      
      let content;
      if (abiPath.endsWith('ZelionBridgeABI.json')) {
        // For the standalone ABI file, replace the entire ABI
        content = artifact.abi;
        fs.writeFileSync(abiPath, JSON.stringify(content, null, 2));
        console.log('✅ Updated with complete ABI');
      } else {
        // For deployment-info files, update the zelionBridgeAbi field
        content = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        content.zelionBridgeAbi = artifact.abi;
        fs.writeFileSync(abiPath, JSON.stringify(content, null, 2));
        console.log('✅ Updated zelionBridgeAbi field');
      }
    }
  }
  
  // Also create a backup of the correct estimateBridgeFee function signature
  console.log('\n--- Correct estimateBridgeFee signature ---');
  console.log('Function: estimateBridgeFee(uint64, address, uint256)');
  console.log('Inputs:');
  console.log('  1. destinationChainSelector (uint64)');
  console.log('  2. token (address)');
  console.log('  3. amount (uint256)');
  console.log('Returns: uint256 (fee amount)');
  
  console.log('\n========== ABI Fix Complete ==========\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
