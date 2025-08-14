const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Minting with account:', deployer.address);

  // ZYL Token contract address on Arbitrum Sepolia
  const ZYL_TOKEN_ADDRESS = '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890';
  
  // User address to mint tokens to
  const USER_ADDRESS = '0x0D9DD7701bb615E0d710b5E082D05549DCbf917c';
  
  // Amount to mint (10,000 ZYL tokens)
  const MINT_AMOUNT = ethers.parseEther('10000');

  // Get the ZYL token contract
  const ZYLToken = await ethers.getContractFactory('ZYLToken');
  const zylToken = ZYLToken.attach(ZYL_TOKEN_ADDRESS);

  console.log('Minting', ethers.formatEther(MINT_AMOUNT), 'ZYL tokens to', USER_ADDRESS);

  try {
    const tx = await zylToken.mint(USER_ADDRESS, MINT_AMOUNT);
    console.log('Transaction hash:', tx.hash);
    
    await tx.wait();
    console.log('✅ Tokens minted successfully!');

    // Check balance
    const balance = await zylToken.balanceOf(USER_ADDRESS);
    console.log('New balance:', ethers.formatEther(balance), 'ZYL');

  } catch (error) {
    console.error('❌ Error minting tokens:', error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
