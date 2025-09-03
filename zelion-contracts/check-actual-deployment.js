const { ethers } = require('ethers');

async function checkDeployment() {
  console.log('Verifying Arbitrum Sepolia deployment...\n');
  
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  // Known faucet address with ZYL tokens
  const faucetAddress = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Check faucet deployment
  const faucetCode = await provider.getCode(faucetAddress);
  console.log(`Faucet at ${faucetAddress}: ${faucetCode !== '0x' ? '✅ DEPLOYED' : '❌ NOT FOUND'}`);
  
  if (faucetCode !== '0x') {
    // Get faucet owner
    const faucetAbi = [
      'function owner() view returns (address)',
      'function tokenWhitelist(address) view returns (bool)'
    ];
    const faucet = new ethers.Contract(faucetAddress, faucetAbi, provider);
    
    try {
      const owner = await faucet.owner();
      console.log(`Faucet owner: ${owner}`);
      
      // Check common ZYL token addresses
      const possibleZYLAddresses = [
        '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Current frontend address
        '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Common local deployment
        '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Alternative
      ];
      
      console.log('\nChecking for ZYL token contract...');
      for (const addr of possibleZYLAddresses) {
        const code = await provider.getCode(addr);
        if (code !== '0x') {
          console.log(`Found contract at ${addr}`);
          
          // Check if it's whitelisted in faucet
          const isWhitelisted = await faucet.tokenWhitelist(addr);
          if (isWhitelisted) {
            console.log(`✅ This is the ZYL token! (whitelisted in faucet)`);
            
            // Check balance
            const tokenAbi = ['function balanceOf(address) view returns (uint256)'];
            const token = new ethers.Contract(addr, tokenAbi, provider);
            const balance = await token.balanceOf(faucetAddress);
            console.log(`Faucet ZYL balance: ${ethers.formatEther(balance)} ZYL`);
            
            return addr;
          }
        }
      }
    } catch (error) {
      console.log('Error checking faucet:', error.message);
    }
  }
  
  console.log('\nNeed to find the correct ZYL token address that is whitelisted in the faucet.');
}

checkDeployment().catch(console.error);
