require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    try {
        // --- Configuration ---
        const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
        let adminPrivateKey = process.env.PRIVATE_KEY; // Must be the private key of a current admin
        const tokenAddress = ethers.getAddress('0x6953C136c5816AdA72C2Ca72349431F2C81CC6e9');
        const recipientAddress = process.argv[2]; // The address to grant the DEFAULT_ADMIN_ROLE to

        // --- Validation and Setup ---
        if (!rpcUrl || !adminPrivateKey) {
            throw new Error('ARBITRUM_SEPOLIA_RPC_URL and PRIVATE_KEY must be set in .env');
        }
        if (!recipientAddress) {
            throw new Error('Usage: node scripts/grantAdminRole.js <recipientAddress>');
        }
        if (!adminPrivateKey.startsWith('0x')) {
            adminPrivateKey = '0x' + adminPrivateKey;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

        const ZYLTOKEN_ABI = [
            "function grantRole(bytes32 role, address account) external",
            "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)"
        ];
        const token = new ethers.Contract(tokenAddress, ZYLTOKEN_ABI, adminWallet);

        console.log('--- Preparing to Grant DEFAULT_ADMIN_ROLE ---');
        console.log(`Current Admin Address: ${adminWallet.address}`);
        console.log(`Recipient Address: ${recipientAddress}`);

        // --- Grant Role ---
        const adminRole = await token.DEFAULT_ADMIN_ROLE();
        console.log(`\nGranting DEFAULT_ADMIN_ROLE to ${recipientAddress}...`);
        const tx = await token.grantRole(adminRole, recipientAddress);

        console.log('Transaction sent. Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('\n--- ADMIN ROLE GRANTED SUCCESSFULLY ---');
        console.log(`Transaction Hash: ${receipt.hash}`);
        console.log('You can view the transaction on Arbiscan:');
        console.log(`https://sepolia.arbiscan.io/tx/${receipt.hash}`);
        console.log('------------------------------------');

    } catch (error) {
        console.error('\n--- SCRIPT FAILED ---');
        console.error('Error details:', error.reason || error.message);
        console.error('----------------------');
        process.exit(1);
    }
}

main();
