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
    
    // Audit: Security tracking
    address public admin;
    bool public initialized;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyBridgeOrAdmin() {
        require(hasRole(BRIDGE_ROLE, msg.sender) || msg.sender == admin, "Only bridge or admin");
        _;
    }
    
    constructor() ERC20("Zelion", "ZYL") {
        admin = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        initialized = true;
    }
    
    // Audit: Initialize function for upgradeability
    function initialize(address _admin) external {
        require(!initialized, "Already initialized");
        admin = _admin;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(BRIDGE_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        initialized = true;
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
    
    // BurnFrom function
    function burnFrom(address account, uint256 amount) external onlyBridgeOrAdmin {
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
    
    // Audit: Admin functions for emergency situations
    function emergencyWithdrawETH(address payable recipient) external onlyAdmin {
        recipient.transfer(address(this).balance);
    }
    
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // Override transfer functions to respect pause
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    // Audit: Supply tracking
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    receive() external payable {}
}
