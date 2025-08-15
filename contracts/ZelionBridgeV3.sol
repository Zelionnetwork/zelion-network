// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
// import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "./interfaces/IZYLToken.sol";

/**
 * @title ZelionBridgeV3
 * @dev Message-only CCIP bridge that burns tokens on source and mints on destination
 * This version works with any ERC20 token without requiring CCIP whitelisting
 */
contract ZelionBridgeV3 is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    IRouterClient public router;
    uint256 public baseFeeBuffer;

    struct TokenConfig {
        bool isSupported;
        bool isBurnable;
        address destinationToken;
        uint64 destinationChainSelector;
    }

    mapping(address => TokenConfig) public tokenConfigs;
    mapping(uint64 => address) public trustedBridges;
    uint256 public baseFeeBuffer;

    event TokensBridged(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address indexed receiver,
        address token,
        uint256 amount
    );

    event TokensReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed receiver,
        address token,
        uint256 amount
    );

    function initialize(address routerAddress) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        router = IRouterClient(routerAddress);
        baseFeeBuffer = 50; // 50% buffer to ensure enough fee
    }
    
    function setBaseFeeBuffer(uint256 _buffer) external onlyOwner {
        require(_buffer <= 100, "Buffer too high");
        baseFeeBuffer = _buffer;
    }

    function setTrustedBridge(uint64 chainSelector, address bridgeAddress) external onlyOwner {
        trustedBridges[chainSelector] = bridgeAddress;
    }

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
            destinationToken: destToken,
            destinationChainSelector: destinationChainSelector
        });
    }

    function estimateBridgeFee(uint64 destinationChainSelector, address token, uint256 amount) public view returns (uint256) {
        require(tokenConfigs[token].isSupported, "Token not supported");
        
        Client.EVM2AnyMessage memory message = _buildMessage(
            destinationChainSelector,
            msg.sender, // receiver
            token,
            amount
        );

        uint256 fee = router.getFee(destinationChainSelector, message);
        return (fee * (100 + baseFeeBuffer)) / 100;
    }

    function bridgeTokens(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) external payable nonReentrant whenNotPaused {
        require(tokenConfigs[token].isSupported, "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(trustedBridges[destinationChainSelector] != address(0), "Destination bridge not trusted");

        uint256 fee = estimateBridgeFee(destinationChainSelector, token, amount);
        require(msg.value >= fee, "Not enough fee");

        // Burn or lock tokens on source chain
        if (tokenConfigs[token].isBurnable) {
            IZYLToken(token).burnFrom(msg.sender, amount);
        } else {
            IZYLToken(token).transferFrom(msg.sender, address(this), amount);
        }

        Client.EVM2AnyMessage memory message = _buildMessage(
            destinationChainSelector,
            receiver,
            token,
            amount
        );

        bytes32 messageId = router.ccipSend{value: fee}(destinationChainSelector, message);

        emit TokensBridged(messageId, destinationChainSelector, receiver, token, amount);

        // Refund excess fee
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }

    function _buildMessage(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) internal view returns (Client.EVM2AnyMessage memory) {
        TokenConfig memory config = tokenConfigs[token];
        require(config.destinationChainSelector == destinationChainSelector, "Unsupported destination chain for this token");

        // Encode bridge data (no token amounts, message-only)
        bytes memory data = abi.encode(receiver, config.destinationToken, amount);

        return Client.EVM2AnyMessage({
            receiver: abi.encode(trustedBridges[destinationChainSelector]),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty - no token transfers
            feeToken: address(0), // Pay with native currency
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 300000}))
        });
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) external {
        require(msg.sender == address(router), "Only router can call");
        uint64 sourceChainSelector = message.sourceChainSelector;
        address sourceBridge = abi.decode(message.sender, (address));
        
        require(trustedBridges[sourceChainSelector] == sourceBridge, "Untrusted source bridge");

        (address receiver, address token, uint256 amount) = abi.decode(message.data, (address, address, uint256));
        
        require(tokenConfigs[token].isSupported, "Token not supported");

        // Mint tokens on destination chain
        IZYLToken(token).mint(receiver, amount);

        emit TokensReceived(message.messageId, sourceChainSelector, receiver, token, amount);
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IZYLToken(token).transfer(owner(), amount);
    }

    receive() external payable {}
}
