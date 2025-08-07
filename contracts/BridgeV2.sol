// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IZYLToken.sol";

contract BridgeV2 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    struct TokenConfig {
        bool isSupported;
        bool isBurnable;
        address destToken;
        uint64 destinationChainSelector;
    }
    
    // Token registry
    mapping(address => TokenConfig) public tokenConfigs;
    mapping(bytes32 => bool) public executedMessages;
    
    // Fee management
    mapping(uint64 => uint256) public chainGasLimits;
    uint256 public baseFeeBuffer; // Percentage buffer for fee estimates
    address internal s_router;
    
    // Events
    event TokensBridged(
        bytes32 indexed messageId,
        uint64 indexed destChain,
        address indexed user,
        address token,
        uint256 amount,
        uint256 fee
    );
    event TokensReceived(
        bytes32 indexed messageId,
        uint64 indexed srcChain,
        address indexed user,
        address token,
        uint256 amount
    );
    event FeeRefunded(
        address indexed user,
        uint256 amount
    );
    event TokenConfigured(
        address indexed token,
        bool isSupported,
        bool isBurnable,
        address destToken,
        uint64 destinationChainSelector
    );
    event GasLimitSet(
        uint64 indexed chainSelector,
        uint256 gasLimit
    );

    function initialize(address _router) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        s_router = _router;
        baseFeeBuffer = 10; // 10% buffer
    }

    function bridgeTokens(
        uint64 destChainSelector,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        TokenConfig memory config = tokenConfigs[token];
        require(config.isSupported, "Token not supported");
        require(config.destinationChainSelector == destChainSelector, "Invalid chain for token");
        
        // Calculate and validate fee
        uint256 estimatedFee = estimateBridgeFee(destChainSelector, token, amount);
        require(msg.value >= estimatedFee, "Insufficient fee");
        
        // Process tokens
        if (config.isBurnable) {
            IZYLToken(token).burnFrom(msg.sender, amount);
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }
        
        // Build CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)), // Bridge-to-bridge
            data: abi.encode(msg.sender, token, amount, config.destToken),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({
                gasLimit: chainGasLimits[destChainSelector] > 0 ? 
                    chainGasLimits[destChainSelector] : 200_000
            })),
            feeToken: address(0)
        });
        
        // Get actual fee
        uint256 actualFee = IRouterClient(getRouter()).getFee(destChainSelector, message);
        
        // Handle fee payment and refund
        require(msg.value >= actualFee, "Insufficient fee for current conditions");
        try IRouterClient(getRouter()).ccipSend{value: actualFee}(destChainSelector, message) 
            returns (bytes32 messageId) 
        {
            emit TokensBridged(messageId, destChainSelector, msg.sender, token, amount, actualFee);
            
            // Refund excess
            if (msg.value > actualFee) {
                uint256 refund = msg.value - actualFee;
                payable(msg.sender).transfer(refund);
                emit FeeRefunded(msg.sender, refund);
            }
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("CCIP send failed: ", reason)));
        } catch (bytes memory lowLevelData) {
            revert("Low-level CCIP failure");
        }
    }
    
    function _ccipReceive(Client.Any2EVMMessage calldata message) 
        internal virtual nonReentrant 
    {
        require(!executedMessages[message.messageId], "Duplicate message");
        executedMessages[message.messageId] = true;
        
        // Decode payload
        (address user, address srcToken, uint256 amount, address destToken) = 
            abi.decode(message.data, (address, address, uint256, address));
        
        // Mint or unlock tokens
        TokenConfig memory config = tokenConfigs[destToken];
        require(config.isSupported, "Token not supported");

        if (config.isBurnable) {
            IZYLToken(destToken).mint(user, amount);
        } else {
            require(IERC20(destToken).transfer(user, amount), "Release transfer failed");
        }
        emit TokensReceived(
            message.messageId,
            message.sourceChainSelector,
            user,
            destToken,
            amount
        );
    }
    
    // Fee estimation with buffer
    function estimateBridgeFee(
        uint64 destChainSelector,
        address token,
        uint256 amount
    ) public view returns (uint256) {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)),
            data: abi.encode(msg.sender, token, amount, tokenConfigs[token].destToken),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({
                gasLimit: chainGasLimits[destChainSelector] > 0 ? 
                    chainGasLimits[destChainSelector] : 200_000
            })),
            feeToken: address(0)
        });
        
        uint256 baseFee = IRouterClient(getRouter()).getFee(destChainSelector, message);
        return baseFee + (baseFee * baseFeeBuffer) / 100;
    }
    
    // Admin functions
    function configureToken(
        address token,
        bool isSupported,
        bool isBurnable,
        address destToken,
        uint64 destinationChainSelector
    ) external onlyOwner {
        tokenConfigs[token] = TokenConfig({
            isSupported: isSupported,
            isBurnable: isBurnable,
            destToken: destToken,
            destinationChainSelector: destinationChainSelector
        });
        emit TokenConfigured(token, isSupported, isBurnable, destToken, destinationChainSelector);
    }
    
    function setChainGasLimit(uint64 chainSelector, uint256 gasLimit) external onlyOwner {
        chainGasLimits[chainSelector] = gasLimit;
        emit GasLimitSet(chainSelector, gasLimit);
    }
    
    function setFeeBuffer(uint256 bufferPercent) external onlyOwner {
        require(bufferPercent <= 50, "Buffer too high");
        baseFeeBuffer = bufferPercent;
    }
    
    function withdrawFees(address payable recipient) external onlyOwner {
        uint256 balance = address(this).balance;
        recipient.transfer(balance);
    }

    function getRouter() public view returns (address) {
        return s_router;
    }
}
