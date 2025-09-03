// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ZYLFaucet is Ownable {
    IERC20 public zylToken;
    uint256 public requestAmount = 100 * 10**18; // 100 ZYL tokens
    uint256 public cooldownTime = 24 hours;
    
    mapping(address => uint256) public lastRequestTime;
    
    event TokensRequested(address indexed user, uint256 amount);
    event FaucetFunded(address indexed funder, uint256 amount);
    event RequestAmountUpdated(uint256 newAmount);
    event CooldownTimeUpdated(uint256 newCooldownTime);
    
    constructor(address _zylToken) Ownable(msg.sender) {
        require(_zylToken != address(0), "Invalid token address");
        zylToken = IERC20(_zylToken);
    }
    
    /**
     * @dev Request ZYL tokens from the faucet
     */
    function requestTokens() external {
        require(
            block.timestamp >= lastRequestTime[msg.sender] + cooldownTime,
            "Please wait for cooldown period"
        );
        require(
            zylToken.balanceOf(address(this)) >= requestAmount,
            "Faucet is empty - please notify admin"
        );
        
        lastRequestTime[msg.sender] = block.timestamp;
        
        require(
            zylToken.transfer(msg.sender, requestAmount),
            "Token transfer failed"
        );
        
        emit TokensRequested(msg.sender, requestAmount);
    }
    
    /**
     * @dev Fund the faucet with ZYL tokens
     * @param amount Amount of tokens to add to the faucet
     */
    function fundFaucet(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            zylToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed - check token approval"
        );
        
        emit FaucetFunded(msg.sender, amount);
    }
    
    /**
     * @dev Update the request amount (owner only)
     * @param newAmount New amount of tokens per request
     */
    function setRequestAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be greater than 0");
        requestAmount = newAmount;
        emit RequestAmountUpdated(newAmount);
    }
    
    /**
     * @dev Update the cooldown time (owner only)
     * @param newCooldownTime New cooldown time in seconds
     */
    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        require(newCooldownTime > 0, "Cooldown must be greater than 0");
        cooldownTime = newCooldownTime;
        emit CooldownTimeUpdated(newCooldownTime);
    }
    
    /**
     * @dev Get remaining cooldown time for a user
     * @param user Address to check
     * @return Remaining cooldown in seconds (0 if ready to request)
     */
    function getCooldownTime(address user) external view returns (uint256) {
        if (lastRequestTime[user] + cooldownTime > block.timestamp) {
            return (lastRequestTime[user] + cooldownTime) - block.timestamp;
        }
        return 0;
    }
    
    /**
     * @dev Get faucet balance
     * @return Current ZYL token balance of the faucet
     */
    function getFaucetBalance() external view returns (uint256) {
        return zylToken.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency withdraw function (owner only)
     * @param amount Amount to withdraw (0 for full balance)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        uint256 balance = zylToken.balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "Insufficient balance");
        require(
            zylToken.transfer(owner(), withdrawAmount),
            "Withdrawal failed"
        );
    }
}
