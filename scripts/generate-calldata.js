const { ethers } = require('ethers');
const deployment = require('../deployments/arbitrumSepolia.json');
const ZelionBridgeABI = require('../artifacts/contracts/ZelionBridge.sol/ZelionBridge.json').abi;
const ZYLTokenABI = require('../artifacts/contracts/ZYLToken.sol/ZYLToken.json').abi;
const ProxyAdminABI = require('../node_modules/@openzeppelin/contracts/build/contracts/ProxyAdmin.json').abi;
require('dotenv').config();

async function main() {
    const newOwnerAddress = process.env.NEW_OWNER_ADDRESS;
    if (!newOwnerAddress) {
        throw new Error('NEW_OWNER_ADDRESS is not set in the .env file.');
    }

    console.log('--- EMERGENCY OWNERSHIP TRANSFER ---');
    console.log('This script generates the transaction data needed to manually transfer ownership of your contracts.');
    console.log('You will need to send these transactions manually from the compromised account using MetaMask or a similar wallet.');
    console.log(`New Owner Address: ${newOwnerAddress}`);

    // 1. ZelionBridge Ownership
    const bridgeInterface = new ethers.Interface(ZelionBridgeABI);
    const bridgeCalldata = bridgeInterface.encodeFunctionData('transferOwnership', [newOwnerAddress]);
    console.log('\n--- 1. Transfer ZelionBridge Ownership ---');
    console.log('  - Go to your wallet (MetaMask).');
    console.log('  - Ensure you are connected to Arbitrum Sepolia and using the COMPROMISED account.');
    console.log('  - Click "Send".');
    console.log(`  - Paste the Bridge Proxy Address into the recipient field: ${deployment.bridge.address}`);
    console.log('  - For the amount, enter 0.');
    console.log('  - In the transaction data / hex data field, paste the following calldata:');
    console.log(`  - Calldata: ${bridgeCalldata}`);
    console.log('  - Submit the transaction.');

    // 2. ProxyAdmin Ownership
    const adminInterface = new ethers.Interface(ProxyAdminABI);
    const adminCalldata = adminInterface.encodeFunctionData('transferOwnership', [newOwnerAddress]);
    console.log('\n--- 2. Transfer ProxyAdmin Ownership ---');
    console.log('  - After the first transaction confirms, send a new transaction.');
    console.log(`  - Recipient (Proxy Admin Address): ${deployment.bridge.admin}`);
    console.log('  - Amount: 0');
    console.log('  - Calldata:');
    console.log(`  - ${adminCalldata}`);
    console.log('  - Submit the transaction.');

    // 3. ZYLToken Admin Role
    const tokenInterface = new ethers.Interface(ZYLTokenABI);
    const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'; // DEFAULT_ADMIN_ROLE
    const tokenCalldata = tokenInterface.encodeFunctionData('grantRole', [ADMIN_ROLE, newOwnerAddress]);
    console.log('\n--- 3. Grant ZYLToken Admin Role ---');
    console.log('  - After the second transaction confirms, send a final transaction.');
    console.log(`  - Recipient (ZYLToken Address): ${deployment.token.address}`);
    console.log('  - Amount: 0');
    console.log('  - Calldata:');
    console.log(`  - ${tokenCalldata}`);
    console.log('  - Submit the transaction.');

    console.log('\n--- COMPLETION ---');
    console.log('After all three transactions are confirmed, your new address will have full control.');
    console.log('You can then update your .env file with your NEW private key and discard the compromised one forever.');
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
