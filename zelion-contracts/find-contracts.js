const { ethers } = require('ethers');

async function findContracts() {
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  
  console.log('Scanning for deployed contracts on Arbitrum Sepolia...\n');
  
  // Known faucet with ZYL tokens
  const FAUCET_ADDRESS = '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0';
  
  // Get faucet events to find ZYL token
  const faucetAbi = [
    'event TokenWhitelisted(address indexed token, bool status)',
    'function tokenWhitelist(address) view returns (bool)',
    'function owner() view returns (address)'
  ];
  
  const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
  
  // Get recent blocks
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = currentBlock - 10000; // Check last 10k blocks
  
  console.log(`Checking blocks ${fromBlock} to ${currentBlock}...`);
  
  // Find whitelisted tokens
  const filter = faucet.filters.TokenWhitelisted();
  const events = await faucet.queryFilter(filter, fromBlock, currentBlock);
  
  console.log(`Found ${events.length} whitelist events`);
  
  let zylTokenAddress = null;
  for (const event of events) {
    const tokenAddr = event.args[0];
    const status = event.args[1];
    if (status) {
      console.log(`Found whitelisted token: ${tokenAddr}`);
      
      // Check if it has ZYL characteristics
      const tokenAbi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function balanceOf(address) view returns (uint256)'
      ];
      
      try {
        const token = new ethers.Contract(tokenAddr, tokenAbi, provider);
        const symbol = await token.symbol();
        if (symbol === 'ZYL') {
          zylTokenAddress = tokenAddr;
          const balance = await token.balanceOf(FAUCET_ADDRESS);
          console.log(`✅ Found ZYL Token at: ${tokenAddr}`);
          console.log(`   Faucet balance: ${ethers.formatEther(balance)} ZYL`);
        }
      } catch (e) {}
    }
  }
  
  // Try transaction history approach
  if (!zylTokenAddress) {
    console.log('\nChecking recent transactions to faucet...');
    // Get transactions to faucet
    // Note: This requires archive node or indexer, may not work with standard RPC
  }
  
  return {
    ZYLToken: zylTokenAddress || 'NOT_FOUND',
    Faucet: FAUCET_ADDRESS
  };
}

findContracts().then(console.log).catch(console.error);
