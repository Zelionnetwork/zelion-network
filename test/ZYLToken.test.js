const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZYLToken", function () {
  let token;
  let owner, bridge, user1, user2;
  let BRIDGE_ROLE, PAUSER_ROLE;

  beforeEach(async function () {
    [owner, bridge, user1, user2] = await ethers.getSigners();
    
    const ZYLToken = await ethers.getContractFactory("ZYLToken");
    token = await ZYLToken.deploy();
    await token.deployed();
    
    BRIDGE_ROLE = await token.BRIDGE_ROLE();
    PAUSER_ROLE = await token.PAUSER_ROLE();
    
    // Grant roles
    await token.grantRole(BRIDGE_ROLE, bridge.address);
    await token.grantRole(PAUSER_ROLE, owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await token.name()).to.equal("Zelion");
      expect(await token.symbol()).to.equal("ZYL");
    });

    it("Should set the correct max supply", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.utils.parseEther("1000000000")); // 1 billion tokens
    });

    it("Should grant roles to deployer", async function () {
      expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(BRIDGE_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow bridge to mint tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      await token.connect(bridge).mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail when non-bridge tries to mint", async function () {
      const amount = ethers.utils.parseEther("100");
      await expect(token.connect(user1).mint(user1.address, amount))
        .to.be.revertedWith("AccessControl");
    });

    it("Should fail when minting exceeds max supply", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      await expect(token.connect(bridge).mint(user1.address, maxSupply.add(1)))
        .to.be.revertedWith("Max supply exceeded");
    });

    it("Should fail when minting while paused", async function () {
      await token.pause();
      const amount = ethers.utils.parseEther("100");
      await expect(token.connect(bridge).mint(user1.address, amount))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to user1
      const amount = ethers.utils.parseEther("1000");
      await token.connect(bridge).mint(user1.address, amount);
    });

    it("Should allow user to burn their own tokens", async function () {
      const burnAmount = ethers.utils.parseEther("100");
      const initialBalance = await token.balanceOf(user1.address);
      
      await token.connect(user1).burn(burnAmount);
      
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(burnAmount));
    });

    it("Should allow bridge to burn from user account with approval", async function () {
      const burnAmount = ethers.utils.parseEther("100");
      const initialBalance = await token.balanceOf(user1.address);
      
      // User approves bridge to spend tokens
      await token.connect(user1).approve(bridge.address, burnAmount);
      
      // Bridge burns from user account
      await token.connect(bridge).burnFrom(user1.address, burnAmount);
      
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance.sub(burnAmount));
    });

    it("Should fail when bridge burns without approval", async function () {
      const burnAmount = ethers.utils.parseEther("100");
      await expect(token.connect(bridge).burnFrom(user1.address, burnAmount))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens to user1
      const amount = ethers.utils.parseEther("1000");
      await token.connect(bridge).mint(user1.address, amount);
    });

    it("Should allow normal transfers", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      
      await token.connect(user1).transfer(user2.address, transferAmount);
      
      const finalBalance1 = await token.balanceOf(user1.address);
      const finalBalance2 = await token.balanceOf(user2.address);
      
      expect(finalBalance1).to.equal(initialBalance1.sub(transferAmount));
      expect(finalBalance2).to.equal(initialBalance2.add(transferAmount));
    });

    it("Should fail when transferring while paused", async function () {
      await token.pause();
      const transferAmount = ethers.utils.parseEther("100");
      await expect(token.connect(user1).transfer(user2.address, transferAmount))
        .to.be.revertedWith("Pausable: paused");
    });

    it("Should allow approved transfers", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      
      // User1 approves user2 to spend tokens
      await token.connect(user1).approve(user2.address, transferAmount);
      
      // User2 transfers from user1 to themselves
      await token.connect(user2).transferFrom(user1.address, user2.address, transferAmount);
      
      const finalBalance1 = await token.balanceOf(user1.address);
      const finalBalance2 = await token.balanceOf(user2.address);
      
      expect(finalBalance1).to.equal(initialBalance1.sub(transferAmount));
      expect(finalBalance2).to.equal(initialBalance2.add(transferAmount));
    });

    it("Should fail approved transfers when paused", async function () {
      await token.pause();
      const transferAmount = ethers.utils.parseEther("100");
      
      // User1 approves user2 to spend tokens
      await token.connect(user1).approve(user2.address, transferAmount);
      
      // User2 tries to transfer from user1 to themselves
      await expect(token.connect(user2).transferFrom(user1.address, user2.address, transferAmount))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause by pauser role", async function () {
      await token.pause();
      expect(await token.paused()).to.be.true;
      
      await token.unpause();
      expect(await token.paused()).to.be.false;
    });

    it("Should fail to pause by non-pauser", async function () {
      await expect(token.connect(user1).pause())
        .to.be.revertedWith("AccessControl");
    });

    it("Should fail to unpause by non-pauser", async function () {
      await token.pause();
      await expect(token.connect(user1).unpause())
        .to.be.revertedWith("AccessControl");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to withdraw ETH", async function () {
      // Send some ETH to token contract
      await owner.sendTransaction({
        to: token.address,
        value: ethers.utils.parseEther("1")
      });
      
      const initialBalance = await ethers.provider.getBalance(user2.address);
      await token.emergencyWithdrawETH(user2.address);
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail to withdraw ETH by non-admin", async function () {
      await expect(token.connect(user1).emergencyWithdrawETH(user2.address))
        .to.be.revertedWith("Only admin");
    });

    it("Should allow admin to update admin address", async function () {
      await token.updateAdmin(user2.address);
      expect(await token.admin()).to.equal(user2.address);
    });

    it("Should fail to update admin by non-admin", async function () {
      await expect(token.connect(user1).updateAdmin(user2.address))
        .to.be.revertedWith("Only admin");
    });

    it("Should fail to update admin to zero address", async function () {
      await expect(token.updateAdmin(ethers.constants.AddressZero))
        .to.be.revertedWith("Invalid admin address");
    });
  });

  describe("Supply Tracking", function () {
    it("Should track circulating supply correctly", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await token.connect(bridge).mint(user1.address, mintAmount);
      
      const circulatingSupply = await token.circulatingSupply();
      expect(circulatingSupply).to.equal(mintAmount);
      
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(mintAmount);
    });
  });
});
