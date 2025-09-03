const Web3 = require('web3');

async function testWeb3() {
  const web3 = new Web3('https://sepolia-rollup.arbitrum.io/rpc');
  
  console.log('Testing contract addresses on Arbitrum Sepolia...\n');
  
  // Known addresses
  const addresses = {
    ZYLToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
    SimpleSwap: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Staking: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  };
  
  // Check each address
  for (const [name, addr] of Object.entries(addresses)) {
    const code = await web3.eth.getCode(addr);
    console.log(`${name} (${addr}): ${code !== '0x' ? 'DEPLOYED' : 'NOT DEPLOYED'}`);
  }
  
  // If faucet is deployed, check for whitelisted tokens
  const faucetCode = await web3.eth.getCode(addresses.Faucet);
  if (faucetCode !== '0x') {
    console.log('\nFaucet is deployed. Checking for ZYL token...');
    
    // The ZYL token must be at a different address
    // Check if SimpleSwap or Staking addresses are actually the token
    const tokenABI = [
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
      }
    ];
    
    // Check if SimpleSwap address is actually ZYL token
    const swapCode = await web3.eth.getCode(addresses.SimpleSwap);
    if (swapCode !== '0x') {
      try {
        const token = new web3.eth.Contract(tokenABI, addresses.SimpleSwap);
        const symbol = await token.methods.symbol().call();
        const balance = await token.methods.balanceOf(addresses.Faucet).call();
        console.log(`\nContract at SimpleSwap address:`);
        console.log(`  Symbol: ${symbol}`);
        console.log(`  Faucet balance: ${web3.utils.fromWei(balance, 'ether')} tokens`);
        
        if (symbol === 'ZYL' && balance > 0) {
          console.log(`  ✅ This is the ZYL token!`);
          return addresses.SimpleSwap;
        }
      } catch (e) {
        console.log(`  Not an ERC20 token`);
      }
    }
    
    // Check if Staking address is actually ZYL token
    const stakingCode = await web3.eth.getCode(addresses.Staking);
    if (stakingCode !== '0x') {
      try {
        const token = new web3.eth.Contract(tokenABI, addresses.Staking);
        const symbol = await token.methods.symbol().call();
        const balance = await token.methods.balanceOf(addresses.Faucet).call();
        console.log(`\nContract at Staking address:`);
        console.log(`  Symbol: ${symbol}`);
        console.log(`  Faucet balance: ${web3.utils.fromWei(balance, 'ether')} tokens`);
        
        if (symbol === 'ZYL' && balance > 0) {
          console.log(`  ✅ This is the ZYL token!`);
          return addresses.Staking;
        }
      } catch (e) {
        console.log(`  Not an ERC20 token`);
      }
    }
  }
}

testWeb3().catch(console.error);
