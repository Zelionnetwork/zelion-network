const { ethers, upgrades } = require('hardhat');
const deployment = require('../deployments/arbitrumSepolia.json');
require('dotenv').config();

// Helper function for adding a delay
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    const newOwnerAddress = process.env.NEW_OWNER_ADDRESS;
    if (!newOwnerAddress) {
        throw new Error('NEW_OWNER_ADDRESS is not set in the .env file.');
    }

    console.log(`Preparing to transfer ownership to: ${newOwnerAddress}`);

    const [compromisedSigner] = await ethers.getSigners();
    console.log(`Using the compromised account: ${compromisedSigner.address} to sign transactions.`);

    // 1. Transfer ownership of the ZelionBridge proxy
    try {
        console.log('\n--- 1/3: Transferring ZelionBridge Ownership ---');
        const ZelionBridge = await ethers.getContractFactory('ZelionBridge', compromisedSigner);
        const zelionBridge = ZelionBridge.attach(deployment.bridge.address);
        const currentBridgeOwner = await zelionBridge.owner();
        console.log(`Current bridge owner: ${currentBridgeOwner}`);
        if (currentBridgeOwner.toLowerCase() !== newOwnerAddress.toLowerCase()) {
            const tx1 = await zelionBridge.transferOwnership(newOwnerAddress);
            console.log('Bridge ownership transfer transaction sent:', tx1.hash);
            await tx1.wait();
            console.log(`New bridge owner: ${await zelionBridge.owner()}`);
            console.log('✅ Bridge ownership transferred successfully.');
        } else {
            console.log('✅ Bridge ownership already transferred.');
        }
    } catch (error) {
        console.error('❌ Failed to transfer bridge ownership:', error);
        throw error; // Stop execution if this fails
    }

    await delay(5000); // Wait 5 seconds before next step

    // 2. Transfer ownership of the ProxyAdmin
    try {
        console.log('\n--- 2/3: Transferring ProxyAdmin Ownership ---');
        const proxyAdmin = await upgrades.admin.getInstance();
        const currentAdminOwner = await proxyAdmin.owner();
        console.log(`Current ProxyAdmin owner: ${currentAdminOwner}`);
        if (currentAdminOwner.toLowerCase() !== newOwnerAddress.toLowerCase()) {
            const tx2 = await proxyAdmin.transferOwnership(newOwnerAddress);
            console.log('ProxyAdmin ownership transfer transaction sent:', tx2.hash);
            await tx2.wait();
            console.log(`New ProxyAdmin owner: ${await proxyAdmin.owner()}`);
            console.log('✅ ProxyAdmin ownership transferred successfully.');
        } else {
            console.log('✅ ProxyAdmin ownership already transferred.');
        }
    } catch (error) {
        console.error('❌ Failed to transfer ProxyAdmin ownership:', error);
        throw error; // Stop execution if this fails
    }

    await delay(5000); // Wait 5 seconds before next step

    // 3. Grant DEFAULT_ADMIN_ROLE for ZYLToken
    try {
        console.log('\n--- 3/3: Granting ZYLToken Admin Role ---');
        const zylToken = await ethers.getContractAt('ZYLToken', deployment.token.address, compromisedSigner);
        const ADMIN_ROLE = await zylToken.DEFAULT_ADMIN_ROLE();
        const hasRole = await zylToken.hasRole(ADMIN_ROLE, newOwnerAddress);
        if (!hasRole) {
            console.log(`Granting DEFAULT_ADMIN_ROLE to ${newOwnerAddress}...`);
            const tx3 = await zylToken.grantRole(ADMIN_ROLE, newOwnerAddress);
            console.log('Admin role grant transaction sent:', tx3.hash);
            await tx3.wait();
            if (await zylToken.hasRole(ADMIN_ROLE, newOwnerAddress)) {
                console.log('✅ New address now has token admin role.');
            } else {
                throw new Error('Role grant transaction was sent but role not assigned.');
            }
        } else {
            console.log('✅ New address already has token admin role.');
        }
        console.log('IMPORTANT: The compromised address still has the admin role. You must revoke it using your new account.');
    } catch (error) {
        console.error('❌ Failed to grant token admin role:', error);
        throw error; // Stop execution if this fails
    }

    console.log('\nOwnership transfer complete. Please secure your new wallet.');
}

main().catch((error) => {
    console.error('\n🚨 An error occurred during the ownership transfer process:');
    console.error(error.message);
    process.exitCode = 1;
});
