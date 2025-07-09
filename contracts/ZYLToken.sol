// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZYLToken is ERC20, Ownable {
    bool public isPaused;

    modifier whenNotPaused() {
        require(!isPaused, "Contract paused");
        _;
    }

    constructor(address initialOwner)
        ERC20("Zylithium", "ZYL")
    {
        _transferOwnership(initialOwner); // ✅ FIXED
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount)
        public
        onlyOwner
        whenNotPaused
    {
        _mint(to, amount);
    }

    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    function emergencyWithdrawETH(address recipient) external onlyOwner {
        (bool success, ) = recipient.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
