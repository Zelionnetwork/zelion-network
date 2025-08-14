require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [tokenAddr, holder] = process.argv.slice(2);
  if (!tokenAddr || !holder) {
    console.error("Usage: node scripts/check-balance.js <tokenAddress> <holderAddress>");
    process.exit(1);
  }
  const erc20 = await ethers.getContractAt("ZYLToken", tokenAddr);
  const [name, symbol, decimals, bal] = await Promise.all([
    erc20.name(),
    erc20.symbol(),
    erc20.decimals(),
    erc20.balanceOf(holder)
  ]);
  const formatted = ethers.utils.formatUnits(bal, decimals);
  console.log(JSON.stringify({ tokenAddr, holder, name, symbol, decimals, raw: bal.toString(), formatted }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
