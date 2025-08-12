import { ethers } from 'ethers';
import ZelionBridgeABI from '../abi/CrossChainTransfer.json';
import ZYLTokenABI from '../abi/ZYLToken.json';
import { 
  ZELION_BRIDGE_ADDRESS, 
  CHAIN_SELECTORS,
  getChainSelector,
  getTokenAddress,
  isChainSupported
} from '../config/tokenAddresses';

class BlockchainService {
  constructor() {
    this.publicClient = null;
    this.walletClient = null;
    this.bridgeContract = null;
    this.tokenContract = null;
  }

  async initialize(publicClient, walletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    
    // Create contract instance with wallet client for transactions
    this.bridgeContract = {
      address: ZELION_BRIDGE_ADDRESS,
      abi: ZelionBridgeABI.abi,
      walletClient: walletClient,
      publicClient: publicClient
    };
  }

  getTokenContract(chainName) {
    const tokenAddress = getTokenAddress(chainName);
    if (!tokenAddress || tokenAddress === '0x...') {
      throw new Error(`ZYL token address not configured for ${chainName}`);
    }
    
    return {
      address: tokenAddress,
      abi: ZYLTokenABI,
      walletClient: this.walletClient,
      publicClient: this.publicClient
    };
  }

  async estimateBridgeFee(fromChain, toChain, amount) {
    try {
      const destinationChainSelector = getChainSelector(toChain);
      if (!destinationChainSelector) {
        throw new Error(`Unsupported destination chain: ${toChain}`);
      }

      const estimatedFee = ethers.parseEther('0.001');
      
      return {
        success: true,
        fee: estimatedFee.toString(),
        estimatedGas: '0',  
      };
    } catch (error) {
      console.error('Error estimating bridge fee:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async approveTokenSpending(chainName, amount) {
    try {
      const tokenContract = this.getTokenContract(chainName);
      
      // Get user address
      const [userAddress] = await this.walletClient.requestAddresses();
      
      // Check current allowance
      const allowance = await this.publicClient.readContract({
        address: tokenContract.address,
        abi: tokenContract.abi,
        functionName: 'allowance',
        args: [userAddress, ZELION_BRIDGE_ADDRESS]
      });

      if (BigInt(allowance) >= BigInt(amount)) {
        return {
          success: true,
          message: 'Sufficient allowance already exists',
        };
      }

      // Approve tokens
      const hash = await this.walletClient.writeContract({
        address: tokenContract.address,
        abi: tokenContract.abi,
        functionName: 'approve',
        args: [ZELION_BRIDGE_ADDRESS, amount]
      });

      // Wait for transaction
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'Token approval successful',
      };
    } catch (error) {
      console.error('Error approving token spending:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  async bridgeTokens(fromChain, toChain, amount, receiverAddress) {
    try {
      const destinationChainSelector = getChainSelector(toChain);
      if (!destinationChainSelector) {
        throw new Error(`Unsupported destination chain: ${toChain}`);
      }

      const fee = ethers.parseEther('0.001');
      
      const minAmountOut = amount;
      const hash = await this.walletClient.writeContract({
        address: this.bridgeContract.address,
        abi: this.bridgeContract.abi,
        functionName: 'transferTokens',
        args: [receiverAddress, amount, minAmountOut],
        value: fee
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'Bridge transaction successful',
      };
    } catch (error) {
      console.error('Error bridging tokens:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTokenBalance(chainName, userAddress) {
    try {
      const tokenContract = this.getTokenContract(chainName);
      const balance = await this.publicClient.readContract({
        address: tokenContract.address,
        abi: tokenContract.abi,
        functionName: 'balanceOf',
        args: [userAddress]
      });
      return {
        success: true,
        balance: balance.toString(),
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getSupportedChains() {
    return Object.keys(CHAIN_SELECTORS);
  }

  getChainSelectorByName(chainName) {
    return getChainSelector(chainName);
  }

  isChainSupportedByName(chainName) {
    return isChainSupported(chainName);
  }
}

export default BlockchainService;
