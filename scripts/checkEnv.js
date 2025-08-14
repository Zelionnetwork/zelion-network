console.log('Attempting to load .env file...');

try {
    require('dotenv').config();

    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    console.log('\n--- Environment Variables Loaded ---');
    console.log(`ARBITRUM_SEPOLIA_RPC_URL: ${rpcUrl}`);
    console.log(`PRIVATE_KEY: ${privateKey ? 'Loaded (hidden for security)' : 'NOT FOUND'}`);
    console.log('------------------------------------');

    if (!rpcUrl || !privateKey) {
        console.error('\nError: One or more required variables are missing from your .env file.');
    } else {
        console.log('\nSuccess: .env file was loaded and variables are present.');
    }

} catch (error) {
    console.error('\n--- FATAL ERROR ---');
    console.error('The .env file could not be parsed. This is likely due to a syntax error.');
    console.error('Please check your .env file for unclosed quotes or invalid characters.');
    console.error('Error details:', error);
    console.error('-------------------');
}
