const fs = require('fs');
const path = require('path');

function updateAbi() {
  console.log('🚀 Updating frontend ABI...');

  // Path to the contract artifact
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'MultiTokenBridge.sol', 'MultiTokenBridge.json');
  
  // Path for the new ABI file in the frontend
  const frontendAbiPath = path.join(__dirname, '..', '..', 'zelion-site', 'src', 'app', 'config', 'bridgeABI.json');

  try {
    // Read the artifact file
    const artifactData = fs.readFileSync(artifactPath, 'utf8');
    const artifact = JSON.parse(artifactData);
    const abi = artifact.abi;

    // Write the ABI to the frontend config directory
    fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));

    console.log(`✅ ABI successfully written to: ${frontendAbiPath}`);
  } catch (error) {
    console.error('❌ Failed to update ABI:', error);
    process.exit(1);
  }
}

updateAbi();
