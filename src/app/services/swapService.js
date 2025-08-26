import { parseUnits, formatUnits, isAddress } from 'viem';

class SwapService {
  constructor() {
    this.publicClient = null;
    this.walletClient = null;
  }

  setProvider(publicClient, walletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  // Zelion contract addresses
  getZelionContracts(chainId) {
    const contracts = {
      421614: { // Arbitrum Sepolia
        WETH: '0x5647C0d20CE3D2B91A2Df24C0886278F865bd58D',
        ZYL: '0xd873a2649c7e1e020C2249A4aaaA248eC02d837B',
        Faucet: '0xAc7c2DDa8b5Dc99b9f38bbB6882F1fb46329D7C0',
        SwapFactory: '0xFCC8DDd6ad3bff23dc44ec49458d9fCF6B080A61',
        SwapRouter: '0xCEd0B7e79cb93a8a58A152289939D0E050D21288',
        Staking: '0xdf0eAf7a0Cc0c6DE5944628BaEa95f3BD5105Cff',
        Bridge: '0x20471cf7A5C04f0640d90584c0d42f01F74eC1B0',
      }
    };
    return contracts[chainId] || {};
  }

  // Common token addresses for supported chains
  getTokenAddresses(chainId) {
    const addresses = {
      // Arbitrum One
      42161: {
        ETH: '0x0000000000000000000000000000000000000000', // Native ETH
        WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        ZYL: '0x0000000000000000000000000000000000000000', // Add actual ZYL address
      },
      // Arbitrum Sepolia
      421614: {
        ETH: '0x0000000000000000000000000000000000000000', // Native ETH
        WETH: '0x5647C0d20CE3D2B91A2Df24C0886278F865bd58D', // Zelion WETH
        USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Testnet USDC
        USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Testnet USDT
        DAI: '0x4AF15ec2A0BD43Db75dd04E680F31C5c2c0c0C6b', // Testnet DAI
        ZYL: '0xd873a2649c7e1e020C2249A4aaaA248eC02d837B', // Zelion Token
      },
      // Polygon
      137: {
        ETH: '0x0000000000000000000000000000000000000000', // Native ETH (wrapped as WMATIC)
        WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        ZYL: '0x0000000000000000000000000000000000000000', // Add actual ZYL address
      },
      // Polygon Amoy
      80002: {
        ETH: '0x0000000000000000000000000000000000000000', // Native ETH (wrapped as WMATIC)
        WETH: '0x2c852e740B62308c46DD29B982FBb650D063Bd07', // Testnet WMATIC
        USDC: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Testnet USDC
        USDT: '0xBD21A10F619BE90d6066c941b04e340BfF4f7f95', // Testnet USDT
        DAI: '0x4A79A376D8A63B2804a1a4353E50bf7e27768B5F', // Testnet DAI
        ZYL: '0x0000000000000000000000000000000000000000', // Add testnet address
      },
    };
    return addresses[chainId] || {};
  }

  // Get token decimals
  getTokenDecimals(tokenSymbol) {
    const decimals = {
      ETH: 18,
      WETH: 18,
      ZYL: 18,
      DAI: 18,
      USDC: 6,
      USDT: 6,
    };
    return decimals[tokenSymbol] || 18;
  }

  // Get token balance
  async getTokenBalance(tokenAddress, userAddress) {
    if (!this.publicClient) throw new Error('Public client not set');

    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      // ETH balance
      const balance = await this.publicClient.getBalance({
        address: userAddress,
      });
      return balance;
    } else {
      // ERC20 token balance
      const erc20Abi = [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'owner', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
        {
          name: 'decimals',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'uint8' }],
        },
      ];
      
      const balance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      });
      return balance;
    }
  }

  // Get token allowance
  async getTokenAllowance(tokenAddress, userAddress, spenderAddress) {
    if (!this.publicClient) throw new Error('Public client not set');
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'); // ETH doesn't need allowance
    }

    const erc20Abi = [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ];
    
    const allowance = await this.publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, spenderAddress],
    });
    return allowance;
  }

  // Approve token spending
  async approveToken(tokenAddress, spenderAddress, amount) {
    if (!this.walletClient) throw new Error('Wallet client not set');
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return { success: true }; // ETH doesn't need approval
    }

    const erc20Abi = [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ];
    
    const hash = await this.walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amount],
    });
    
    await this.publicClient.waitForTransactionReceipt({ hash });
    return { success: true, transactionHash: hash };
  }

  // Get swap quote (mock implementation - replace with actual DEX integration)
  async getSwapQuote(fromToken, toToken, amount, chainId) {
    // Mock price data - replace with actual price feeds
    const mockPrices = {
      'ETH-USDC': 2000,
      'USDC-ETH': 0.0005,
      'ETH-ZYL': 1000,
      'ZYL-ETH': 0.001,
      'ZYL-USDC': 2,
      'USDC-ZYL': 0.5,
      'ETH-DAI': 2000,
      'DAI-ETH': 0.0005,
      'ZYL-DAI': 2,
      'DAI-ZYL': 0.5,
    };

    const priceKey = `${fromToken}-${toToken}`;
    const price = mockPrices[priceKey] || 1;
    
    const outputAmount = amount * price;
    const priceImpact = 0.1; // 0.1% price impact
    const minimumReceived = outputAmount * (1 - priceImpact / 100);

    return {
      inputAmount: amount,
      outputAmount: outputAmount,
      priceImpact: priceImpact,
      minimumReceived: minimumReceived,
      price: price,
    };
  }

  // Execute swap using Zelion SwapRouter
  async executeSwap(fromToken, toToken, amount, slippage, userAddress, chainId) {
    if (!this.walletClient) throw new Error('Wallet client not set');

    try {
      // Get quote
      const quote = await this.getSwapQuote(fromToken, toToken, amount, chainId);
      
      // Calculate minimum received with slippage
      const minimumReceived = quote.outputAmount * (1 - slippage / 100);
      
      // Get token addresses
      const tokenAddresses = this.getTokenAddresses(chainId);
      const zelionContracts = this.getZelionContracts(chainId);
      const fromTokenAddress = tokenAddresses[fromToken];
      const toTokenAddress = tokenAddresses[toToken];
      
      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error(`Token addresses not configured for ${fromToken} or ${toToken} on this chain`);
      }

      if (!zelionContracts.SwapRouter) {
        throw new Error('Zelion SwapRouter not available on this chain');
      }
      
      // Convert amounts to wei
      const fromDecimals = this.getTokenDecimals(fromToken);
      const toDecimals = this.getTokenDecimals(toToken);
      const amountIn = this.parseTokenAmount(amount, fromDecimals);
      const amountOutMin = this.parseTokenAmount(minimumReceived.toString(), toDecimals);
      
      // SwapRouter ABI (simplified for common swap functions)
      const swapRouterAbi = [
        {
          name: 'swapExactTokensForTokens',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' }
          ],
          outputs: [{ name: 'amounts', type: 'uint256[]' }],
        },
        {
          name: 'swapExactETHForTokens',
          type: 'function',
          stateMutability: 'payable',
          inputs: [
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' }
          ],
          outputs: [{ name: 'amounts', type: 'uint256[]' }],
        },
        {
          name: 'swapExactTokensForETH',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' }
          ],
          outputs: [{ name: 'amounts', type: 'uint256[]' }],
        }
      ];

      // Create swap path
      const path = [fromTokenAddress, toTokenAddress];
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes from now

      let hash;
      
      if (fromToken === 'ETH') {
        // ETH to Token swap
        hash = await this.walletClient.writeContract({
          address: zelionContracts.SwapRouter,
          abi: swapRouterAbi,
          functionName: 'swapExactETHForTokens',
          args: [amountOutMin, path, userAddress, deadline],
          value: amountIn,
        });
      } else if (toToken === 'ETH') {
        // Token to ETH swap
        hash = await this.walletClient.writeContract({
          address: zelionContracts.SwapRouter,
          abi: swapRouterAbi,
          functionName: 'swapExactTokensForETH',
          args: [amountIn, amountOutMin, path, userAddress, deadline],
        });
      } else {
        // Token to Token swap
        hash = await this.walletClient.writeContract({
          address: zelionContracts.SwapRouter,
          abi: swapRouterAbi,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, amountOutMin, path, userAddress, deadline],
        });
      }
      
      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return {
        success: true,
        transactionHash: hash,
        quote: quote,
        minimumReceived: minimumReceived,
        receipt: receipt,
        message: 'Swap executed successfully using Zelion SwapRouter!'
      };
    } catch (error) {
      console.error('Swap execution failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get supported tokens for a chain
  getSupportedTokens(chainId) {
    const tokenAddresses = this.getTokenAddresses(chainId);
    return Object.keys(tokenAddresses).filter(symbol => 
      tokenAddresses[symbol] !== '0x0000000000000000000000000000000000000000'
    );
  }

  // Format token amount
  formatTokenAmount(amount, decimals) {
    return formatUnits(amount, decimals);
  }

  // Parse token amount
  parseTokenAmount(amount, decimals) {
    return parseUnits(amount.toString(), decimals);
  }

  // Get tokens from Zelion Faucet
  async getTokensFromFaucet(tokenSymbol, userAddress, chainId) {
    if (!this.walletClient) throw new Error('Wallet client not set');

    try {
      const zelionContracts = this.getZelionContracts(chainId);
      
      if (!zelionContracts.Faucet) {
        throw new Error('Zelion Faucet not available on this chain');
      }

      // Faucet ABI (simplified)
      const faucetAbi = [
        {
          name: 'requestTokens',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [],
        }
      ];

      // Get token address
      const tokenAddresses = this.getTokenAddresses(chainId);
      const tokenAddress = tokenAddresses[tokenSymbol];
      
      if (!tokenAddress) {
        throw new Error(`Token ${tokenSymbol} not available on this chain`);
      }

      // Request 100 tokens (adjust amount as needed)
      const amount = this.parseTokenAmount('100', this.getTokenDecimals(tokenSymbol));

      const hash = await this.walletClient.writeContract({
        address: zelionContracts.Faucet,
        abi: faucetAbi,
        functionName: 'requestTokens',
        args: [tokenAddress, amount],
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        receipt: receipt,
        message: `Successfully requested ${tokenSymbol} tokens from faucet!`
      };
    } catch (error) {
      console.error('Faucet request failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new SwapService();
