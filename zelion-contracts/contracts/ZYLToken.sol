// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZYLToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor() ERC20("Zelion Token", "ZYL") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 100_000_000 * 10**18); // 100 million tokens
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    // Function for faucet to mint tokens
    function faucetMint(address to, uint256 amount) external {
        require(amount <= 1000 * 10**18, "Amount too high"); // Max 1000 ZYL per request
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
