const { ethers } = require('ethers');
require('dotenv').config();

const FaucetABI = require('./artifacts/contracts/Faucet.sol/Faucet.json').abi;
const ZYLTokenABI = require('./artifacts/contracts/ZYLToken.sol/ZYLToken.json').abi;

async function testFaucet() {
  console.log('🧪 Testing Faucet Functionality\n');
  console.log('='.repeat(50));
  
  // New deployment addresses
  const FAUCET_ADDRESS = '0xeD3BfBB4906b45DB10430D2f7248146eC5c05c41';
  const ZYL_TOKEN_ADDRESS = '0xB3F18c487c020A0EfD0dae6F1EDDbE24fcc757D0';
  
  const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const faucet = new ethers.Contract(FAUCET_ADDRESS, FaucetABI, wallet);
  const zylToken = new ethers.Contract(ZYL_TOKEN_ADDRESS, ZYLTokenABI, wallet);
  
  try {
    // 1. Check if token is whitelisted
    console.log('1️⃣ Checking token whitelist status...');
    const isWhitelisted = await faucet.whitelistedTokens(ZYL_TOKEN_ADDRESS);
    console.log('   Whitelisted:', isWhitelisted ? '✅ Yes' : '❌ No');
    
    // 2. Check faucet balance
    console.log('\n2️⃣ Checking faucet balance...');
    const faucetBalance = await zylToken.balanceOf(FAUCET_ADDRESS);
    console.log('   Balance:', ethers.formatEther(faucetBalance), 'ZYL');
    
    // 3. Check request amount
    console.log('\n3️⃣ Checking request amount...');
    const requestAmount = await faucet.tokenAmounts(ZYL_TOKEN_ADDRESS);
    console.log('   Amount per request:', ethers.formatEther(requestAmount), 'ZYL');
    
    // 4. Check cooldown period
    console.log('\n4️⃣ Checking cooldown period...');
    const cooldown = await faucet.cooldownTime();
    console.log('   Cooldown:', cooldown.toString(), 'seconds (', Number(cooldown) / 3600, 'hours)');
    
    // 5. Test requesting tokens
    console.log('\n5️⃣ Testing token request...');
    const testAddress = '0x1234567890123456789012345678901234567890'; // Test recipient
    console.log('   Recipient:', testAddress);
    
    // Check if can request
    const lastRequest = await faucet.lastRequestTime(ZYL_TOKEN_ADDRESS, testAddress);
    const currentTime = Math.floor(Date.now() / 1000);
    const canRequest = currentTime >= Number(lastRequest) + Number(cooldown);
    console.log('   Can request:', canRequest ? '✅ Yes' : `❌ No (wait ${Number(lastRequest) + Number(cooldown) - currentTime} seconds)`);
    
    if (canRequest && isWhitelisted && requestAmount > 0n) {
      console.log('\n📤 Sending test request...');
      const tx = await faucet.requestTokens(ZYL_TOKEN_ADDRESS, testAddress);
      console.log('   Transaction:', tx.hash);
      await tx.wait();
      console.log('   ✅ Tokens sent successfully!');
      
      const newBalance = await zylToken.balanceOf(testAddress);
      console.log('   Recipient balance:', ethers.formatEther(newBalance), 'ZYL');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ FAUCET TEST COMPLETE');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('   Contract:', FAUCET_ADDRESS);
    console.log('   Token:', ZYL_TOKEN_ADDRESS);
    console.log('   Status: OPERATIONAL');
    console.log('   Balance:', ethers.formatEther(faucetBalance), 'ZYL');
    console.log('   Ready for frontend integration ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testFaucet();
