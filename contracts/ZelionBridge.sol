// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "./interfaces/IZYLToken.sol";

contract ZelionBridge is
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

    event TokensBridged(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address indexed receiver,
        address token,
        uint256 amount
    );

    function initialize(address routerAddress) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        router = IRouterClient(routerAddress);
        baseFeeBuffer = 10; // 10% buffer
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
    ) external payable {
        require(tokenConfigs[token].isSupported, "Token not supported");
        require(amount > 0, "Amount must be > 0");

        uint256 fee = estimateBridgeFee(destinationChainSelector, token, amount);
        require(msg.value >= fee, "Not enough fee");

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
    }

    function _buildMessage(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) internal view returns (Client.EVM2AnyMessage memory) {
        TokenConfig memory config = tokenConfigs[token];
        require(config.destinationChainSelector == destinationChainSelector, "Unsupported destination chain for this token");

        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: config.destinationToken,
            amount: amount
        });

        return Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            feeToken: address(0), // Pay with native currency
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 200000}))
        });
    }

    function _ccipReceive(Client.Any2EVMMessage calldata message) external {
        // Implementation for receiving tokens from other chains
        // This needs to be secured properly in a real implementation
    }
}