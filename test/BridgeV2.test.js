const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BridgeV2 Phase 2 Features", function() {
  let bridge, token, owner, user;
  
  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("ZYLToken");
    token = await Token.deploy();
    
    const Bridge = await ethers.getContractFactory("BridgeV2");
    bridge = await upgrades.deployProxy(Bridge, []);
    await bridge.deployed();
    
    await bridge.initialize(owner.address);
    await token.grantRole(await token.MINTER_ROLE(), bridge.address);
    
    // Configure token
    await bridge.configureToken(
      token.address,
      true,
      true,
      token.address,
      500 // Arbitrum
    );
  });

  it("Should handle multi-token bridging", async () => {
    // Add second token
    const Token2 = await ethers.getContractFactory("ZYLToken");
    const token2 = await Token2.deploy();
    await bridge.configureToken(
      token2.address,
      true,
      true,
      token2.address,
      500
    );
    
    // Bridge both tokens
    await token.mint(user.address, 1000);
    await token2.mint(user.address, 1000);
    
    await token.connect(user).approve(bridge.address, 500);
    await token2.connect(user).approve(bridge.address, 500);
    
    const fee = await bridge.estimateBridgeFee(500, token.address, 500);
    await bridge.connect(user).bridgeTokens(500, token.address, 500, { value: fee });
    
    const fee2 = await bridge.estimateBridgeFee(500, token2.address, 500);
    await bridge.connect(user).bridgeTokens(500, token2.address, 500, { value: fee2 });
  });

  it("Should refund excess fees", async () => {
    await token.mint(user.address, 1000);
    await token.connect(user).approve(bridge.address, 500);
    
    const fee = await bridge.estimateBridgeFee(500, token.address, 500);
    const overpayment = fee.mul(2);
    const balanceBefore = await ethers.provider.getBalance(user.address);
    
    const tx = await bridge.connect(user).bridgeTokens(500, token.address, 500, { 
      value: overpayment 
    });
    const receipt = await tx.wait();
    
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const balanceAfter = await ethers.provider.getBalance(user.address);
    
    const expectedRefund = overpayment.sub(fee);
    const actualRefund = balanceAfter.sub(balanceBefore).add(gasUsed).add(500); // Add bridged amount
    
    expect(actualRefund).to.be.closeTo(expectedRefund, ethers.utils.parseEther("0.001"));
  });

  it("Should handle CCIP failures gracefully", async () => {
    // Force a failure by setting insufficient gas
    await bridge.setChainGasLimit(500, 50_000); // Too low
    
    await token.mint(user.address, 1000);
    await token.connect(user).approve(bridge.address, 500);
    
    const fee = await bridge.estimateBridgeFee(500, token.address, 500);
    
    await expect(
      bridge.connect(user).bridgeTokens(500, token.address, 500, { value: fee })
    ).to.be.revertedWith("CCIP send failed");
  });

  it("Should allow fee buffer adjustment", async () => {
    await bridge.setFeeBuffer(20);
    expect(await bridge.baseFeeBuffer()).to.equal(20);
    
    const fee = await bridge.estimateBridgeFee(500, token.address, 500);
    expect(fee).to.be.gt(0);
  });
});
