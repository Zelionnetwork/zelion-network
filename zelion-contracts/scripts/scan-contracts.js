const { ethers } = require('ethers');

async function scanContracts() {
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
    
    console.log('Checking contract deployment on Arbitrum Sepolia...\n');
    
    // Faucet is confirmed at this address with ZYL tokens
    const FAUCET = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
    
    // Scan for the actual ZYL token by checking transaction logs
    // The actual ZYL token must be different from 0x5FbDB2315678afecb367f032d93F642f64180aa3
    // since that address returns no data
    
    // Common deployment patterns - check sequential addresses
    const baseAddr = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
    const baseNum = BigInt(baseAddr);
    
    console.log('Scanning nearby addresses for ZYL token...');
    
    // Check addresses deployed around the same time as faucet
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      
      const checkAddr = '0x' + (baseNum + BigInt(i)).toString(16).padStart(40, '0');
      const code = await provider.getCode(checkAddr);
      
      if (code !== '0x' && code.length > 100) {
        console.log(`Found contract at: ${checkAddr}`);
        
        // Try to call symbol() to see if it's ZYL
        try {
          const abi = ['function symbol() view returns (string)'];
          const contract = new ethers.Contract(checkAddr, abi, provider);
          const symbol = await contract.symbol();
          if (symbol === 'ZYL') {
            console.log(`✅ FOUND ZYL TOKEN at: ${checkAddr}`);
            return checkAddr;
          }
        } catch (e) {
          // Not an ERC20 token
        }
      }
    }
    
    // Also check if the faucet has Transfer events that reveal the token address
    const faucetAbi = ['event TokenRequested(address indexed user, address indexed token, uint256 amount)'];
    const faucet = new ethers.Contract(FAUCET, faucetAbi, provider);
    
    const currentBlock = await provider.getBlockNumber();
    const filter = faucet.filters.TokenRequested();
    const events = await faucet.queryFilter(filter, currentBlock - 5000, currentBlock);
    
    if (events.length > 0) {
      const tokenAddr = events[0].args[1];
      console.log(`Found token from faucet events: ${tokenAddr}`);
      return tokenAddr;
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scanContracts();
