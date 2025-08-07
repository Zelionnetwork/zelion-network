// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./interfaces/IZYLToken.sol";

/**
 * @title SimpleBridge
 * @dev A simplified cross-chain bridge for ZYL tokens
 * This version works without CCIP dependencies for immediate deployment
 */
contract SimpleBridge is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    struct TokenConfig {
        bool isSupported;
        bool isBurnable;
        address destToken;
        uint256 destChainId;
    }
    
    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        uint256 destChainId;
        uint256 nonce;
        bool processed;
    }
    
    // State variables
    mapping(address => TokenConfig) public tokenConfigs;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(uint256 => address) public trustedBridges;
    mapping(address => uint256) public userNonces;
    
    uint256 public bridgeFee;
    address public feeRecipient;
    
    // Events
    event TokensBridged(
        bytes32 indexed txHash,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 destChainId,
        uint256 nonce
    );
    
    event TokensReceived(
        bytes32 indexed txHash,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 srcChainId
    );
    
    event BridgeConfigured(uint256 chainId, address bridgeAddress);
    event TokenConfigured(address token, bool isSupported, bool isBurnable);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _feeRecipient) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        feeRecipient = _feeRecipient;
        bridgeFee = 0.001 ether; // Default bridge fee
    }
    
    /**
     * @dev Bridge tokens to another chain
     */
    function bridgeTokens(
        address token,
        uint256 amount,
        uint256 destChainId
    ) external payable nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        
        TokenConfig memory config = tokenConfigs[token];
        require(config.isSupported, "Token not supported");
        require(config.destChainId == destChainId, "Invalid destination chain");
        require(trustedBridges[destChainId] != address(0), "No trusted bridge on destination");
        
        uint256 nonce = userNonces[msg.sender]++;
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            destChainId,
            nonce,
            block.chainid
        ));
        
        // Handle token transfer based on configuration
        if (config.isBurnable) {
            // Burn tokens on source chain
            IZYLToken(token).burnFrom(msg.sender, amount);
        } else {
            // Lock tokens on source chain
            require(IZYLToken(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }
        
        // Send fee to recipient
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokensBridged(txHash, msg.sender, token, amount, destChainId, nonce);
    }
    
    /**
     * @dev Process incoming bridge transaction (called by authorized relayer)
     */
    function processIncomingTransfer(
        address user,
        address token,
        uint256 amount,
        uint256 srcChainId,
        bytes32 srcTxHash
    ) external onlyOwner nonReentrant whenNotPaused {
        require(!processedTransactions[srcTxHash], "Transaction already processed");
        require(trustedBridges[srcChainId] != address(0), "Untrusted source chain");
        
        processedTransactions[srcTxHash] = true;
        
        TokenConfig memory config = tokenConfigs[token];
        require(config.isSupported, "Token not supported");
        
        if (config.isBurnable) {
            // Mint tokens on destination chain
            IZYLToken(token).mint(user, amount);
        } else {
            // Release locked tokens
            require(IZYLToken(token).transfer(user, amount), "Transfer failed");
        }
        
        emit TokensReceived(srcTxHash, user, token, amount, srcChainId);
    }
    
    /**
     * @dev Configure token support
     */
    function configureToken(
        address token,
        bool isSupported,
        bool isBurnable,
        address destToken,
        uint256 destChainId
    ) external onlyOwner {
        tokenConfigs[token] = TokenConfig({
            isSupported: isSupported,
            isBurnable: isBurnable,
            destToken: destToken,
            destChainId: destChainId
        });
        
        emit TokenConfigured(token, isSupported, isBurnable);
    }
    
    /**
     * @dev Set trusted bridge on another chain
     */
    function setTrustedBridge(uint256 chainId, address bridge) external onlyOwner {
        trustedBridges[chainId] = bridge;
        emit BridgeConfigured(chainId, bridge);
    }
    
    /**
     * @dev Set bridge fee
     */
    function setBridgeFee(uint256 _fee) external onlyOwner {
        bridgeFee = _fee;
    }
    
    /**
     * @dev Set fee recipient
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }
    
    /**
     * @dev Pause bridge operations
     */
    function pauseBridge() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause bridge operations
     */
    function unpauseBridge() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency token recovery
     */
    function recoverToken(address token, address to, uint256 amount) external onlyOwner {
        IZYLToken(token).transfer(to, amount);
    }
    
    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(feeRecipient).transfer(balance);
    }
    
    /**
     * @dev Get bridge request hash
     */
    function getBridgeHash(
        address user,
        address token,
        uint256 amount,
        uint256 destChainId,
        uint256 nonce,
        uint256 srcChainId
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, token, amount, destChainId, nonce, srcChainId));
    }
}
