async function main() {
  console.log('--- Debug Script ---');
  console.log('Attempting to initialize Hardhat environment...');

  const [deployer] = await hre.ethers.getSigners();

  console.log('Hardhat environment loaded successfully.');
  console.log('Network:', hre.network.name);
  console.log('Deployer account:', deployer.address);
  console.log('--- End Debug Script ---');
}

main().catch((error) => {
  console.error('Debug script failed:');
  console.error(error);
  process.exitCode = 1;
});
