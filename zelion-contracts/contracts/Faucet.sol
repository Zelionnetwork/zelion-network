// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet is Ownable {
    uint256 public constant NATIVE_AMOUNT = 0.1 ether;
    uint256 public constant TOKEN_AMOUNT = 1000 * 10**18; // 1000 tokens
    uint256 public constant COOLDOWN_TIME = 24 hours;
    
    mapping(address => uint256) public lastRequestTime;
    mapping(address => bool) public tokenWhitelist;
    
    event NativeTokensRequested(address indexed user, uint256 amount);
    event TokensRequested(address indexed user, address indexed token, uint256 amount);
    event TokenWhitelisted(address indexed token, bool status);
    
    constructor() Ownable(msg.sender) {}
    
    receive() external payable {}
    
    function requestNativeTokens() external {
        require(
            block.timestamp >= lastRequestTime[msg.sender] + COOLDOWN_TIME,
            "Please wait 24 hours between requests"
        );
        require(address(this).balance >= NATIVE_AMOUNT, "Faucet is empty");
        
        lastRequestTime[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: NATIVE_AMOUNT}("");
        require(success, "Transfer failed");
        
        emit NativeTokensRequested(msg.sender, NATIVE_AMOUNT);
    }
    
    function requestTokens(address token, uint256 amount) external {
        require(
            block.timestamp >= lastRequestTime[msg.sender] + COOLDOWN_TIME,
            "Please wait 24 hours between requests"
        );
        require(tokenWhitelist[token], "Token not whitelisted");
        require(amount <= TOKEN_AMOUNT, "Amount exceeds limit");
        
        lastRequestTime[msg.sender] = block.timestamp;
        
        // Try to mint tokens if the token supports it
        (bool success, ) = token.call(
            abi.encodeWithSignature("faucetMint(address,uint256)", msg.sender, amount)
        );
        
        if (!success) {
            // If minting fails, try regular transfer
            IERC20 tokenContract = IERC20(token);
            require(
                tokenContract.balanceOf(address(this)) >= amount,
                "Insufficient token balance"
            );
            require(tokenContract.transfer(msg.sender, amount), "Transfer failed");
        }
        
        emit TokensRequested(msg.sender, token, amount);
    }
    
    function whitelistToken(address token, bool status) external onlyOwner {
        tokenWhitelist[token] = status;
        emit TokenWhitelisted(token, status);
    }
    
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    function withdrawToken(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(tokenContract.transfer(owner(), balance), "Token withdrawal failed");
    }
    
    function getCooldownTime(address user) external view returns (uint256) {
        if (lastRequestTime[user] + COOLDOWN_TIME > block.timestamp) {
            return (lastRequestTime[user] + COOLDOWN_TIME) - block.timestamp;
        }
        return 0;
    }
}
