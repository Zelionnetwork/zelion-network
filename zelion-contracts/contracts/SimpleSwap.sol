// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    uint256 public constant FEE_PERCENT = 3; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    struct Pool {
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalLiquidity;
    }
    
    mapping(address => mapping(address => Pool)) public pools;
    mapping(address => mapping(address => mapping(address => uint256))) public liquidity;
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event LiquidityAdded(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    constructor() Ownable(msg.sender) {}
    
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant returns (uint256 liquidityMinted) {
        require(token0 != token1, "Identical tokens");
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");
        
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        (uint256 amountA, uint256 amountB) = token0 < token1 ? (amount0, amount1) : (amount1, amount0);
        
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        
        Pool storage pool = pools[tokenA][tokenB];
        
        if (pool.totalLiquidity == 0) {
            liquidityMinted = sqrt(amountA * amountB);
            pool.reserve0 = amountA;
            pool.reserve1 = amountB;
        } else {
            uint256 liquidity0 = (amountA * pool.totalLiquidity) / pool.reserve0;
            uint256 liquidity1 = (amountB * pool.totalLiquidity) / pool.reserve1;
            liquidityMinted = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
            
            pool.reserve0 += amountA;
            pool.reserve1 += amountB;
        }
        
        pool.totalLiquidity += liquidityMinted;
        liquidity[msg.sender][tokenA][tokenB] += liquidityMinted;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidityMinted);
    }
    
    function removeLiquidity(
        address token0,
        address token1,
        uint256 liquidityAmount
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        
        require(liquidity[msg.sender][tokenA][tokenB] >= liquidityAmount, "Insufficient liquidity");
        
        Pool storage pool = pools[tokenA][tokenB];
        
        amount0 = (liquidityAmount * pool.reserve0) / pool.totalLiquidity;
        amount1 = (liquidityAmount * pool.reserve1) / pool.totalLiquidity;
        
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalLiquidity -= liquidityAmount;
        liquidity[msg.sender][tokenA][tokenB] -= liquidityAmount;
        
        IERC20(tokenA).safeTransfer(msg.sender, amount0);
        IERC20(tokenB).safeTransfer(msg.sender, amount1);
        
        (amount0, amount1) = token0 < token1 ? (amount0, amount1) : (amount1, amount0);
        
        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1, liquidityAmount);
    }
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0, "Invalid amount");
        
        (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
        Pool storage pool = pools[token0][token1];
        
        require(pool.totalLiquidity > 0, "Pool does not exist");
        
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        
        if (tokenIn == token0) {
            amountOut = (amountInWithFee * pool.reserve1) / (pool.reserve0 + amountInWithFee);
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
        } else {
            amountOut = (amountInWithFee * pool.reserve0) / (pool.reserve1 + amountInWithFee);
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
        }
        
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
        Pool memory pool = pools[token0][token1];
        
        if (pool.totalLiquidity == 0) return 0;
        
        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        
        if (tokenIn == token0) {
            return (amountInWithFee * pool.reserve1) / (pool.reserve0 + amountInWithFee);
        } else {
            return (amountInWithFee * pool.reserve0) / (pool.reserve1 + amountInWithFee);
        }
    }
    
    function getPoolInfo(address token0, address token1) external view returns (
        uint256 reserve0,
        uint256 reserve1,
        uint256 totalLiquidity
    ) {
        (address tokenA, address tokenB) = token0 < token1 ? (token0, token1) : (token1, token0);
        Pool memory pool = pools[tokenA][tokenB];
        
        if (token0 == tokenA) {
            return (pool.reserve0, pool.reserve1, pool.totalLiquidity);
        } else {
            return (pool.reserve1, pool.reserve0, pool.totalLiquidity);
        }
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
