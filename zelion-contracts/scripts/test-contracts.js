const hre = require("hardhat");

async function main() {
  console.log("Testing contract functionality on Arbitrum Sepolia...\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with account:", signer.address);
  
  // Contract addresses (from deployment)
  const addresses = {
    ZYLToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    Faucet: "0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0",
    SimpleSwap: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    Staking: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  };
  
  // Test gas estimation for different operations
  console.log("=== Gas Fee Estimates ===");
  
  // Estimate faucet request
  try {
    const faucetABI = [
      "function requestNativeTokens() external",
      "function requestTokens(address token, uint256 amount) external",
      "function lastRequestTime(address) external view returns (uint256)"
    ];
    const faucet = new hre.ethers.Contract(addresses.Faucet, faucetABI, signer);
    
    const gasEstimate = await faucet.requestNativeTokens.estimateGas();
    const gasPrice = await hre.ethers.provider.getFeeData();
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    
    console.log("Faucet Request:");
    console.log("  Gas Units:", gasEstimate.toString());
    console.log("  Gas Price:", hre.ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    console.log("  Estimated Cost:", hre.ethers.formatEther(estimatedCost), "ETH");
    console.log("  USD Value (@ $2000/ETH):", (parseFloat(hre.ethers.formatEther(estimatedCost)) * 2000).toFixed(4), "USD");
  } catch (error) {
    console.log("Faucet gas estimation:", error.message);
  }
  
  // Test token operations
  console.log("\n=== Token Operations ===");
  try {
    const tokenABI = [
      "function balanceOf(address) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function totalSupply() external view returns (uint256)"
    ];
    const token = new hre.ethers.Contract(addresses.ZYLToken, tokenABI, signer);
    
    const balance = await token.balanceOf(signer.address);
    console.log("ZYL Balance:", hre.ethers.formatUnits(balance, 18), "ZYL");
    
    // Estimate transfer gas
    const transferGas = await token.transfer.estimateGas(addresses.Faucet, hre.ethers.parseUnits("1", 18));
    console.log("Transfer Gas:", transferGas.toString(), "units");
    
    // Estimate approve gas
    const approveGas = await token.approve.estimateGas(addresses.Staking, hre.ethers.parseUnits("100", 18));
    console.log("Approve Gas:", approveGas.toString(), "units");
  } catch (error) {
    console.log("Token operations:", error.message);
  }
  
  // Test staking operations
  console.log("\n=== Staking Operations ===");
  try {
    const stakingABI = [
      "function stake(uint256 amount) external",
      "function unstake(uint256 amount) external",
      "function claimRewards() external",
      "function balanceOf(address) external view returns (uint256)",
      "function pendingRewards(address) external view returns (uint256)"
    ];
    const staking = new hre.ethers.Contract(addresses.Staking, stakingABI, signer);
    
    const stakeGas = await staking.stake.estimateGas(hre.ethers.parseUnits("10", 18));
    console.log("Stake Gas:", stakeGas.toString(), "units");
    
    const claimGas = await staking.claimRewards.estimateGas();
    console.log("Claim Rewards Gas:", claimGas.toString(), "units");
  } catch (error) {
    console.log("Staking operations:", error.message);
  }
  
  // Test swap operations  
  console.log("\n=== Swap Operations ===");
  try {
    const swapABI = [
      "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external returns (uint256)",
      "function addLiquidity(address token0, address token1, uint256 amount0, uint256 amount1) external returns (uint256)",
      "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)"
    ];
    const swap = new hre.ethers.Contract(addresses.SimpleSwap, swapABI, signer);
    
    // Estimate swap gas
    const swapGas = await swap.swap.estimateGas(
      addresses.ZYLToken,
      "0x0000000000000000000000000000000000000000",
      hre.ethers.parseUnits("10", 18),
      0
    );
    console.log("Swap Gas:", swapGas.toString(), "units");
  } catch (error) {
    console.log("Swap operations:", error.message);
  }
  
  console.log("\n✅ Testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
