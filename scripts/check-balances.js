require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
  if (!rpcUrl) throw new Error('Missing ARBITRUM_SEPOLIA_RPC_URL in .env');
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const user = (process.argv[2] || '').trim();
  if (!user) throw new Error('Usage: node scripts/check-balances.js <userAddress>');

  const tokens = [
    { name: 'ZYL current', addr: '0xEAccd130B812f8b7D8C4404bb08c0Ff82F5B6890' },
    { name: 'ZYL old?', addr: '0x6953C136c5816AdA72C2Ca72349431F2C81CC6e9' },
  ];

  const erc20 = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];

  for (const t of tokens) {
    try {
      const c = new ethers.Contract(t.addr, erc20, provider);
      const [bal, dec, sym] = await Promise.all([
        c.balanceOf(user),
        c.decimals().catch(() => 18),
        c.symbol().catch(() => t.name),
      ]);
      const human = Number(ethers.formatUnits(bal, dec));
      console.log(`${t.name} (${sym}) @ ${t.addr}:`);
      console.log(`  raw: ${bal.toString()}`);
      console.log(`  human: ${human}`);
    } catch (e) {
      console.log(`${t.name} @ ${t.addr}: error ${e.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
