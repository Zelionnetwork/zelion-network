require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [txHash, tokenAddr] = process.argv.slice(2);
  if (!txHash) {
    console.error("Usage: node scripts/check-tx.js <txHash> [tokenAddress]");
    process.exit(1);
  }
  const tx = await ethers.provider.getTransaction(txHash);
  if (!tx) {
    console.error("Transaction not found");
    process.exit(1);
  }
  const rec = await ethers.provider.getTransactionReceipt(txHash);
  const result = { hash: txHash, from: tx.from, to: tx.to, status: rec && rec.status, logs: rec ? rec.logs.length : 0 };

  // If it's an ERC20 transfer, decode input to get recipient and amount
  let transfer;
  try {
    const erc20Iface = new ethers.utils.Interface([
      "function transfer(address to, uint256 value)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ]);
    const decoded = erc20Iface.parseTransaction({ data: tx.data, value: tx.value });
    if (decoded && decoded.name === "transfer") {
      transfer = { to: decoded.args[0], value: decoded.args[1].toString() };
      result.erc20Transfer = transfer;
    }
  } catch (_) {}

  // If token address provided or if tx.to looks like a token, fetch balance for recipient
  const tokenAddress = tokenAddr || tx.to;
  if (transfer && tokenAddress) {
    try {
      const erc20 = new ethers.Contract(tokenAddress, [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ], ethers.provider);
      const [dec, sym, bal] = await Promise.all([
        erc20.decimals(),
        erc20.symbol(),
        erc20.balanceOf(transfer.to)
      ]);
      result.token = { address: tokenAddress, symbol: sym, decimals: dec };
      result.recipientBalance = { raw: bal.toString(), formatted: ethers.utils.formatUnits(bal, dec) };
    } catch (e) {
      result.tokenError = e.message;
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
