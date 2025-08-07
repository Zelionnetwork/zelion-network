// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./overrides/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IZYLToken.sol";

contract Bridge is CCIPReceiver, Ownable, ReentrancyGuard, Pausable {
    struct TokenConfig {
        bool isSupported;
        bool isBurnable;
        address destToken;
        uint64 destinationChainSelector;
    }

    uint256 public constant MAX_FEE_BUFFER = 50;
    mapping(address => TokenConfig) public tokenConfigs;
    mapping(bytes32 => bool) public executedMessages;
    mapping(uint64 => uint256) public chainGasLimits;
    mapping(uint64 => address) public trustedBridges;
    uint256 public baseFeeBuffer;

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
    event FeeRefunded(address indexed user, uint256 amount);
    event BridgeConfigured(uint64 chainSelector, address bridgeAddress);
    event ChainGasLimitUpdated(uint64 chainSelector, uint256 gasLimit);

    constructor(address router) CCIPReceiver(router) {
        baseFeeBuffer = 10; // 10% buffer
    }

    function bridgeTokens(
        uint64 destinationChainSelector,
        address token,
        uint256 amount
    ) external payable nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");
        require(token != address(0), "Invalid token");

        TokenConfig memory config = tokenConfigs[token];
        require(config.isSupported, "Token not supported");
        require(config.destinationChainSelector == destinationChainSelector, "Invalid chain for token");
        require(trustedBridges[destinationChainSelector] != address(0), "Destination bridge not configured");

        uint256 estimatedFee = estimateBridgeFee(destinationChainSelector, token, amount);
        require(msg.value >= estimatedFee, "Insufficient fee");

        if (config.isBurnable) {
            IZYLToken(token).burnFrom(msg.sender, amount);
        } else {
            IZYLToken(token).transferFrom(msg.sender, address(this), amount);
        }

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(trustedBridges[destinationChainSelector]),
            data: abi.encode(msg.sender, token, amount, config.destToken),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({
                gasLimit: chainGasLimits[destinationChainSelector] > 0 ? 
                    chainGasLimits[destinationChainSelector] : 200_000
            })),
            feeToken: address(0)
        });

        uint256 actualFee = IRouterClient(getRouter()).getFee(destinationChainSelector, message);
        require(msg.value >= actualFee, "Insufficient fee");

        try IRouterClient(getRouter()).ccipSend{value: actualFee}(destinationChainSelector, message) 
            returns (bytes32 messageId) 
        {
            emit TokensBridged(messageId, destinationChainSelector, msg.sender, token, amount, actualFee);
            if (msg.value > actualFee) {
                uint256 refund = msg.value - actualFee;
                payable(msg.sender).transfer(refund);
                emit FeeRefunded(msg.sender, refund);
            }
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("CCIP send failed: ", reason)));
        } catch (bytes memory) {
            revert("CCIP operation failed");
        }
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) 
        internal override nonReentrant whenNotPaused 
    {
        require(!executedMessages[message.messageId], "Duplicate message");
        executedMessages[message.messageId] = true;

        uint64 sourceChain = message.sourceChainSelector;
        address sourceBridge = abi.decode(message.sender, (address));
        require(sourceBridge == trustedBridges[sourceChain], "Untrusted source");

        (address user, address srcToken, uint256 amount, address destToken) = 
            abi.decode(message.data, (address, address, uint256, address));

        TokenConfig memory config = tokenConfigs[destToken];
        require(config.isSupported, "Token not supported");

        if (config.isBurnable) {
            IZYLToken(destToken).mint(user, amount);
        } else {
            require(IZYLToken(destToken).transfer(user, amount), "Release transfer failed");
        }

        emit TokensReceived(message.messageId, sourceChain, user, destToken, amount);
    }

    function estimateBridgeFee(
        uint64 destinationChainSelector,
        address token,
        uint256 amount
    ) public view returns (uint256) {
        require(tokenConfigs[token].isSupported, "Token not supported");

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(trustedBridges[destinationChainSelector]),
            data: abi.encode(msg.sender, token, amount, tokenConfigs[token].destToken),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({
                gasLimit: chainGasLimits[destinationChainSelector] > 0 ? 
                    chainGasLimits[destinationChainSelector] : 200_000
            })),
            feeToken: address(0)
        });

        uint256 baseFee = IRouterClient(getRouter()).getFee(destinationChainSelector, message);
        return baseFee + (baseFee * baseFeeBuffer) / 100;
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
            destToken: destToken,
            destinationChainSelector: destinationChainSelector
        });
    }

    function setTrustedBridge(uint64 chainSelector, address bridge) external onlyOwner {
        trustedBridges[chainSelector] = bridge;
        emit BridgeConfigured(chainSelector, bridge);
    }

    function setChainGasLimit(uint64 chainSelector, uint256 gasLimit) external onlyOwner {
        chainGasLimits[chainSelector] = gasLimit;
        emit ChainGasLimitUpdated(chainSelector, gasLimit);
    }

    function setFeeBuffer(uint256 bufferPercent) external onlyOwner {
        require(bufferPercent <= MAX_FEE_BUFFER, "Buffer too high");
        baseFeeBuffer = bufferPercent;
    }

    function pauseBridge() external onlyOwner {
        _pause();
    }

    function unpauseBridge() external onlyOwner {
        _unpause();
    }

    function withdrawFees(address payable recipient) external onlyOwner {
        uint256 balance = address(this).balance;
        recipient.transfer(balance);
    }

    function recoverToken(address token, address to, uint256 amount) external onlyOwner {
        IZYLToken(token).transfer(to, amount);
    }
}
