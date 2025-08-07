const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bridge Security", function() {
  let bridge, token, owner, user;
  
  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("ZYLToken");
    token = await Token.deploy();
    
    const Bridge = await ethers.getContractFactory("Bridge");
    bridge = await upgrades.deployProxy(Bridge, []);
    
    await bridge.initialize("0xE561d5E02207fb5eB32cca20a699E0d8919a1476", token.address);
    
    // Grant BRIDGE_ROLE to bridge (minting is now restricted to BRIDGE_ROLE)
    const BRIDGE_ROLE = await token.BRIDGE_ROLE();
    await token.grantRole(BRIDGE_ROLE, bridge.address);
    
    // Revoke DEFAULT_ADMIN_ROLE for security
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    await token.revokeRole(DEFAULT_ADMIN_ROLE, owner.address);
  });

  it("Should reject untrusted source", async () => {
    const maliciousMessage = {
      sourceChainSelector: 999,
      sender: ethers.utils.defaultAbiCoder.encode(["address"], [ethers.constants.AddressZero]),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"], 
        [user.address, ethers.utils.parseEther("100")]
      )
    };
    
    await expect(bridge.ccipReceive(maliciousMessage))
      .to.be.revertedWith("Untrusted source");
  });

  it("Should prevent replay attacks", async () => {
    // First simulate a valid message
    const messageId = ethers.utils.keccak256("0x01");
    await bridge.ccipReceive({
      messageId: messageId,
      sourceChainSelector: 1,
      sender: ethers.utils.defaultAbiCoder.encode(["address"], [bridge.address]),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"], 
        [user.address, ethers.utils.parseEther("100")]
      )
    });
    
    // Attempt replay
    await expect(bridge.ccipReceive({
      messageId: messageId,
      sourceChainSelector: 1,
      sender: ethers.utils.defaultAbiCoder.encode(["address"], [bridge.address]),
      data: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"], 
        [user.address, ethers.utils.parseEther("100")]
      )
    })).to.be.revertedWith("Duplicate message");
  });

  it("Should refund excess ETH", async () => {
    const balanceBefore = await ethers.provider.getBalance(user.address);
    
    // Estimate fee (simulate)
    const feeEstimate = ethers.utils.parseEther("0.1");
    const overpayment = ethers.utils.parseEther("0.05");
    
    // Send tokens with overpayment
    await token.connect(user).approve(bridge.address, ethers.utils.parseEther("100"));
    await bridge.connect(user).sendTokens(1, ethers.utils.parseEther("10"), {
      value: feeEstimate.add(overpayment)
    });
    
    const balanceAfter = await ethers.provider.getBalance(user.address);
    const diff = balanceBefore.sub(balanceAfter);
    
    expect(diff.lt(feeEstimate.add(overpayment))).to.be.true;
    expect(diff.gt(feeEstimate)).to.be.true;
  });
});
