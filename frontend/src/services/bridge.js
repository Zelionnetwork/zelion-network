import bridgeABI from '../abis/BridgeV2.json';

export const bridgeTokens = async (provider, bridgeAddress, token, amount, chainId) => {
  const signer = provider.getSigner();
  const bridgeContract = new ethers.Contract(bridgeAddress, bridgeABI, signer);
  
  try {
    // Estimate fee with buffer
    const fee = await bridgeContract.estimateBridgeFee(chainId, token.address, amount);
    
    // Execute bridge
    const tx = await bridgeContract.bridgeTokens(
      chainId,
      token.address,
      amount,
      { value: fee.mul(105).div(100) } // 5% extra buffer
    );
    
    const receipt = await tx.wait();
    
    // Check for refund event
    const refundEvent = receipt.events.find(e => e.event === "FeeRefunded");
    if (refundEvent) {
      return {
        success: true,
        refund: refundEvent.args.amount.toString()
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Bridging failed:", error);
    return { 
      success: false, 
      error: error.reason || error.message 
    };
  }
};

export const getTokenConfig = async (provider, bridgeAddress, tokenAddress) => {
  const bridgeContract = new ethers.Contract(bridgeAddress, bridgeABI, provider);
  return bridgeContract.tokenConfigs(tokenAddress);
};
