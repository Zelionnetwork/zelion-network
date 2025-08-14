const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("ZelionBridge", function () {
  let bridge, token;
  let owner, user1, user2;
  let routerAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy token
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    token = await ZYLToken.deploy();
    
    // Deploy bridge
    const ZelionBridge = await ethers.getContractFactory("ZelionBridge");
    bridge = await upgrades.deployProxy(ZelionBridge, [owner.address]);
    
    // Configure token in bridge
    await bridge.configureToken(
      token.target,
      true,  // isSupported
      true,  // isBurnable
      token.target,  // destToken
      0       // destChain
    );
    
    // Grant BRIDGE_ROLE to bridge
    const BRIDGE_ROLE = await token.BRIDGE_ROLE();
    await token.grantRole(BRIDGE_ROLE, bridge.target);
    
    // Mint some tokens to user1 for testing
    await token.mint(user1.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bridge.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct base fee buffer", async function () {
      expect(await bridge.baseFeeBuffer()).to.equal(10);
    });
  });

  describe("Token Configuration", function () {
    it("Should configure token correctly", async function () {
      const config = await bridge.tokenConfigs(token.target);
      expect(config.isSupported).to.be.true;
      expect(config.isBurnable).to.be.true;
      expect(config.destToken).to.equal(token.target);
      expect(config.destChain).to.equal(0);
    });

    it("Should emit TokenConfigured event", async function () {
      await expect(bridge.configureToken(
        user2.address,
        true,
        false,
        user2.address,
        1
      )).to.emit(bridge, "TokenConfigured");
    });
  });

  describe("Bridge Functionality", function () {
    it("Should fail to bridge with unsupported token", async function () {
      await expect(bridge.bridgeTokens(
        0,
        user2.address,
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.1") }
      )).to.be.revertedWith("Token not supported");
    });

    it("Should fail to bridge with zero amount", async function () {
      await expect(bridge.connect(user1).bridgeTokens(
        0,
        token.target,
        0,
        { value: ethers.parseEther("0.1") }
      )).to.be.revertedWith("Invalid amount");
    });

    it("Should fail to bridge with zero token address", async function () {
      await expect(bridge.connect(user1).bridgeTokens(
        0,
        ethers.ZeroAddress,
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.1") }
      )).to.be.revertedWith("Invalid token");
    });

    it("Should fail with insufficient fee", async function () {
      await expect(bridge.connect(user1).bridgeTokens(
        0,
        token.target,
        ethers.parseEther("1"),
        { value: 0 }
      )).to.be.revertedWith("Insufficient fee");
    });

    it("Should allow bridging tokens with sufficient fee", async function () {
      const amount = ethers.parseEther("10");
      const fee = ethers.parseEther("0.1");
      
      // Approve bridge to spend tokens
      await token.connect(user1).approve(bridge.target, amount);
      
      // Check initial balance
      const initialBalance = await token.balanceOf(user1.address);
      
      // Bridge tokens
      await expect(bridge.connect(user1).bridgeTokens(
        0,
        token.target,
        amount,
        { value: fee }
      )).to.emit(bridge, "TokensBridged");
      
      // Check final balance
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance - amount);
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause the bridge", async function () {
      await bridge.pauseBridge();
      expect(await bridge.paused()).to.be.true;
      
      await bridge.unpauseBridge();
      expect(await bridge.paused()).to.be.false;
    });

    it("Should prevent bridging when paused", async function () {
      await bridge.pauseBridge();
      
      const amount = ethers.parseEther("10");
      const fee = ethers.parseEther("0.1");
      
      await token.connect(user1).approve(bridge.target, amount);
      
      await expect(bridge.connect(user1).bridgeTokens(
        0,
        token.target,
        amount,
        { value: fee }
      )).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Fee Management", function () {
    it("Should estimate bridge fee correctly", async function () {
      const estimatedFee = await bridge.estimateBridgeFee(0, token.target, ethers.parseEther("1"));
      expect(estimatedFee).to.be.gt(0);
    });

    it("Should set base fee buffer correctly", async function () {
      await bridge.setBaseFeeBuffer(20);
      expect(await bridge.baseFeeBuffer()).to.equal(20);
    });

    it("Should fail to set base fee buffer too high", async function () {
      await expect(bridge.setBaseFeeBuffer(100)).to.be.revertedWith("Buffer too high");
    });
  });

  describe("Admin Functions", function () {
    it("Should set chain gas limit", async function () {
      await bridge.setChainGasLimit(1, 300000);
      expect(await bridge.chainGasLimits(1)).to.equal(300000);
    });

    it("Should emit GasLimitSet event", async function () {
      await expect(bridge.setChainGasLimit(1, 300000))
        .to.emit(bridge, "GasLimitSet")
        .withArgs(1, 300000);
    });

    it("Should withdraw ETH", async function () {
      // Send some ETH to bridge
      await owner.sendTransaction({
        to: bridge.target,
        value: ethers.parseEther("1")
      });
      
      const initialBalance = await ethers.provider.getBalance(user2.address);
      await bridge.withdrawETH(user2.address);
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
