require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    try {
        // --- Configuration ---
        const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
        let privateKey = process.env.PRIVATE_KEY;
        const tokenAddress = ethers.getAddress('0x6953C136c5816AdA72C2Ca72349431F2C81CC6e9');
        const recipientAddress = process.argv[2];
        const amountToMint = process.argv[3];

        if (!recipientAddress || !amountToMint) {
            throw new Error('Usage: node scripts/manualMint.js <recipientAddress> <amount>');
        }

        // --- Validation and Setup ---
        if (!rpcUrl || !privateKey) {
            throw new Error('ARBITRUM_SEPOLIA_RPC_URL and PRIVATE_KEY must be set in .env');
        }
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        const ZYLTOKEN_ABI = ["function mint(address to, uint256 amount) external"];
        const token = new ethers.Contract(tokenAddress, ZYLTOKEN_ABI, wallet);

        console.log('--- Preparing Manual Mint Transaction ---');
        console.log(`Signer Address: ${wallet.address}`);

        // --- Create Unsigned Transaction ---
        const amount = ethers.parseUnits(amountToMint, 18);
        const nonce = await provider.getTransactionCount(wallet.address, 'latest');
        const feeData = await provider.getFeeData();

        // --- Send Transaction ---
        console.log(`\nMinting ${amountToMint} ZYL to ${recipientAddress}...`);
        const tx = await token.mint(recipientAddress, amount);

        console.log('Transaction sent. Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('\n--- TRANSACTION SUCCESSFUL ---');
        console.log(`Transaction Hash: ${receipt.hash}`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log('------------------------------------');
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
