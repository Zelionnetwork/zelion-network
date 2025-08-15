// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiTokenBridge is Ownable {
    IRouterClient public immutable router;
    
    // Multi-token support
    struct TokenConfig {
        bool isSupported;
        uint256 minAmount;
        uint256 maxAmount;
    }
    
    mapping(address => TokenConfig) public tokenConfigs;
    mapping(uint64 => bool) public supportedChains;
    
    bool public isPaused;

    event TokenConfigured(address indexed token, bool isSupported, uint256 minAmount, uint256 maxAmount);
    event ChainConfigured(uint64 indexed chainSelector, bool isSupported);
    event BridgeInitiated(
        address indexed token,
        uint64 indexed destinationChain,
        address indexed receiver,
        uint256 amount,
        bytes32 messageId
    );

    error UnsupportedToken(address token);
    error UnsupportedChain(uint64 chainSelector);
    error AmountOutOfRange(uint256 amount, uint256 min, uint256 max);
    error InsufficientFeeBalance(uint256 required, uint256 available);
    error UserTransferFailed();
    error RouterApprovalFailed();

    modifier whenNotPaused() {
        require(!isPaused, "Bridge paused");
        _;
    }

    modifier onlySupported(address token) {
        if (!tokenConfigs[token].isSupported) {
            revert UnsupportedToken(token);
        }
        _;
    }

    constructor(address _router) {
        _transferOwnership(msg.sender);
        router = IRouterClient(_router);
    }

    // Configure token support
    function setTokenConfig(
        address token,
        bool isSupported,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlyOwner {
        tokenConfigs[token] = TokenConfig({
            isSupported: isSupported,
            minAmount: minAmount,
            maxAmount: maxAmount
        });
        
        emit TokenConfigured(token, isSupported, minAmount, maxAmount);
    }

    // Configure chain support
    function setChainSupport(uint64 chainSelector, bool isSupported) external onlyOwner {
        supportedChains[chainSelector] = isSupported;
        emit ChainConfigured(chainSelector, isSupported);
    }

    // Estimate bridge fee
    function estimateBridgeFee(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) external view returns (uint256 fee) {
        // Create token amount array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Create message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: "",
            feeToken: address(0) // Pay in native ETH
        });

        return router.getFee(destinationChainSelector, message);
    }

    // Bridge tokens across chains
    function bridgeTokens(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) external payable whenNotPaused onlySupported(token) {
        // Validate chain support
        if (!supportedChains[destinationChainSelector]) {
            revert UnsupportedChain(destinationChainSelector);
        }

        // Validate amount range
        TokenConfig memory config = tokenConfigs[token];
        if (amount < config.minAmount || amount > config.maxAmount) {
            revert AmountOutOfRange(amount, config.minAmount, config.maxAmount);
        }

        // Transfer tokens from user to this contract
        IERC20 tokenContract = IERC20(token);
        if (!tokenContract.transferFrom(msg.sender, address(this), amount)) {
            revert UserTransferFailed();
        }

        // Approve router to spend tokens. Resetting to 0 first is a safety measure.
        tokenContract.approve(address(router), 0);
        if (!tokenContract.approve(address(router), amount)) {
            revert RouterApprovalFailed();
        }

        // Create token amount array
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Create cross-chain message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: "",
            feeToken: address(0) // Pay in native ETH
        });

        // Calculate required fee
        uint256 fee = router.getFee(destinationChainSelector, message);
        if (msg.value < fee) {
            revert InsufficientFeeBalance(fee, msg.value);
        }

        // Send cross-chain message
        bytes32 messageId = router.ccipSend{value: fee}(destinationChainSelector, message);

        // Refund excess ETH
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit BridgeInitiated(token, destinationChainSelector, receiver, amount, messageId);
    }

    // Emergency functions
    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    // Withdraw stuck tokens (emergency)
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    // Withdraw ETH
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
