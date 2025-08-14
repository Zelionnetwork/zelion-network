// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ZYLToken is ERC20, AccessControl, Pausable {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Maximum supply: 1 billion tokens with 18 decimals
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    constructor() ERC20("Zelion", "ZYL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // Mint function restricted to BRIDGE_ROLE
    function mint(address to, uint256 amount) external onlyRole(BRIDGE_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    // Burn function
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // BurnFrom function, restricted to the bridge
    function burnFrom(address account, uint256 amount) external onlyRole(BRIDGE_ROLE) {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    // Pause functionality
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Override transfer functions to respect pause
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }
}
