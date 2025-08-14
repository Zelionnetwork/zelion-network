require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    try {
        // --- Configuration ---
        const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
        let privateKey = process.env.PRIVATE_KEY;
        const tokenAddress = ethers.getAddress('0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890');
        const amountToMint = '10000'; // Amount of ZYL to mint

        // --- Validation and Setup ---
        if (!rpcUrl || !privateKey) {
            throw new Error('ARBITRUM_SEPOLIA_RPC_URL and PRIVATE_KEY must be set in .env');
        }
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        const ZYLTOKEN_ABI = [
            "function mint(address to, uint256 amount) external",
            "function balanceOf(address) view returns (uint256)"
        ];
        const token = new ethers.Contract(tokenAddress, ZYLTOKEN_ABI, wallet);

        console.log(`Using wallet: ${wallet.address}`);
        const recipientAddress = ethers.getAddress('0x0D9DD7701bb615E0d710b5E082D05549DCbf917c');
        console.log(`Attempting to mint ${amountToMint} ZYL to ${recipientAddress}...`);

        // --- Mint Transaction ---
        const amount = ethers.parseUnits(amountToMint, 18);
        const tx = await token.mint(recipientAddress, amount, { gasLimit: 500000 });

        console.log(`Mint transaction sent. Hash: ${tx.hash}`);
        console.log('Waiting for confirmation...');
        await tx.wait();
        console.log('Transaction confirmed!');

        // --- Verification ---
        const balance = await token.balanceOf(recipientAddress);
        console.log(`\nSuccessfully minted. New balance of recipient: ${ethers.formatUnits(balance, 18)} ZYL`);

    } catch (error) {
        console.error('\n--- MINTING FAILED ---');
        console.error('An error occurred during the minting process.');
        console.error('Please check your RPC connection and that the wallet has the BRIDGE_ROLE.');
        console.error('Error details:', error.reason || error.message);
        console.error('----------------------');
        process.exit(1);
    }
}

main();
