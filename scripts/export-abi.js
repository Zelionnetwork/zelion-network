const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Exporting ZelionBridgeV3 ABI...");
  
  // Get the compiled artifact
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ZelionBridgeV3.sol/ZelionBridgeV3.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Extract just the ABI
  const abi = artifact.abi;
  
  // Save to frontend directory
  const outputPath = path.join(__dirname, '../../zelion-site/src/app/abi/ZelionBridgeABI.json');
  fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
  
  console.log(`✅ ABI exported to ${outputPath}`);
  console.log(`ABI has ${abi.length} entries`);
}

main().catch(console.error);
