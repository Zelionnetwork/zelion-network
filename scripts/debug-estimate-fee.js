const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  if (chainId !== 421614) { // Arbitrum Sepolia
    console.error('This script must be run on Arbitrum Sepolia.');
    return;
  }

  // Hardcoded addresses from the latest deployment
  const bridgeAddress = '0x9197F8E2e13B67701B2fFb32C13Cc49c4916d7D4';
  const tokenAddress = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';

  console.log('Using hardcoded addresses:');
  console.log('  Bridge:', bridgeAddress);
  console.log('  Token:', tokenAddress);

  const ZelionBridge = await ethers.getContractFactory('ZelionBridge');
  const bridgeContract = ZelionBridge.attach(bridgeAddress);

  // Parameters from the frontend error
  const destinationChainSelector = '16281711391670634445'; // Avalanche Fuji
  const amount = ethers.utils.parseEther('1'); // 1 ZYL

  console.log(`\nEstimating bridge fee for...`);
  console.log(`  Destination Chain (Selector): ${destinationChainSelector}`);
  console.log(`  Token Address: ${tokenAddress}`);
  console.log(`  Amount: ${ethers.utils.formatEther(amount)} ZYL`);
  console.log(`  Bridge Contract: ${bridgeAddress}`);

  try {
    const fee = await bridgeContract.estimateBridgeFee(
      destinationChainSelector,
      tokenAddress,
      amount
    );
    console.log(`\n✅ Successfully estimated fee: ${ethers.utils.formatEther(fee)} ETH`);
  } catch (error) {
    console.error('\n❌ Error estimating bridge fee:');
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
