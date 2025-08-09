const { ethers } = require('ethers');
const ZYLTokenABI = require('../artifacts/contracts/ZYLToken.sol/ZYLToken.json').abi;

async function main() {
    // The address of the deployed ZYLToken contract
    const zylTokenAddress = '0x6953C136c5816AdA72C2Ca72349431F2C81CC6e9';

    // The address to mint the tokens to (the deployer wallet)
    const recipientAddress = '0x07B2CfBe1bd51325a8bFbE9399AAB494420111E1';

    // The amount of tokens to mint (1 billion with 18 decimals)
    const amountToMint = ethers.parseUnits('1000000000', 18);

    // Create an interface instance to encode the function data
    const zylTokenInterface = new ethers.Interface(ZYLTokenABI);

    // Encode the calldata for the mint function
    const calldata = zylTokenInterface.encodeFunctionData('mint', [
        recipientAddress,
        amountToMint
    ]);

    console.log('--- MANUAL MINT TRANSACTION ---');
    console.log('Please use the compromised account to send this transaction.');
    console.log('\n1. Open MetaMask and connect to Arbitrum Sepolia.');
    console.log('2. Click \'Send\'.');
    console.log('3. Paste the ZYLToken contract address into the recipient field:');
    console.log(`   ${zylTokenAddress}`);
    console.log('4. Set the amount to 0 ETH.');
    console.log('5. In the transaction data / hex data field, paste the following calldata:');
    console.log(`   ${calldata}`);
    console.log('\n6. Submit the transaction.');
    console.log('\nAfter the transaction confirms, the tokens will be in your wallet.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
