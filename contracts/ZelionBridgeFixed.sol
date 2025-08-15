// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZelionBridgeFixed is Ownable {
    IRouterClient public router;
    IERC20 public bnm;  // CCIP-BnM on Arbitrum Sepolia

    // Polygon Amoy selector (confirmed from official docs)
    uint64 public constant POLYGON_AMOY_SELECTOR = 16281711391670634445;
    uint64 public constant AVALANCHE_FUJI_SELECTOR = 14767482510784806043;

    mapping(uint64 => bool) public supportedChains;

    event Bridged(address indexed from, address indexed to, uint256 amount, bytes32 msgId, uint256 fee, uint64 destChain);

    error UnsupportedChain(uint64 chainSelector);
    error AmountZero();
    error PullTokensFailed();
    error ApproveRouterFailed();
    error FeeTooLow(uint256 required, uint256 provided);
    error RefundFailed();

    constructor(address _router, address _bnm) {
        _transferOwnership(msg.sender);
        router = IRouterClient(_router);
        bnm = IERC20(_bnm);
        
        // Enable supported chains
        supportedChains[POLYGON_AMOY_SELECTOR] = true;
        supportedChains[AVALANCHE_FUJI_SELECTOR] = true;
    }

    function bridgeBNM(address receiver, uint256 amount, uint64 destChainSelector) external payable {
        require(amount > 0, "AmountZero");
        require(supportedChains[destChainSelector], "UnsupportedChain");

        // Pull tokens from user into this bridge
        if (!bnm.transferFrom(msg.sender, address(this), amount)) {
            revert PullTokensFailed();
        }

        // Reset approval to 0 first (safety measure), then approve router
        bnm.approve(address(router), 0);
        if (!bnm.approve(address(router), amount)) {
            revert ApproveRouterFailed();
        }

        // Build tokenAmounts array correctly
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(bnm),
            amount: amount
        });

        // Extra args with explicit gas limit for destination execution
        // Using manual encoding for EVMExtraArgsV1 structure
        bytes memory extraArgs = abi.encodeWithSelector(
            bytes4(keccak256("EVMExtraArgsV1")),
            200_000 // gasLimit
        );

        // Receiver MUST be abi.encode(address), not raw address
        bytes memory encodedReceiver = abi.encode(receiver);

        // Build the message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: encodedReceiver,
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: extraArgs,
            feeToken: address(0) // pay fee in native ETH
        });

        // Get exact fee required
        uint256 fee = router.getFee(destChainSelector, message);
        if (msg.value < fee) {
            revert FeeTooLow(fee, msg.value);
        }

        // Send with error bubbling
        bytes32 msgId;
        try router.ccipSend{value: fee}(destChainSelector, message) returns (bytes32 messageId) {
            msgId = messageId;
            emit Bridged(msg.sender, receiver, amount, msgId, fee, destChainSelector);
        } catch (bytes memory reason) {
            revert(string(abi.encodePacked("ccipSend revert: ", reason)));
        }

        // Refund any excess ETH
        if (msg.value > fee) {
            (bool success,) = msg.sender.call{value: msg.value - fee}("");
            if (!success) {
                revert RefundFailed();
            }
        }
    }

    // Estimate fee function
    function estimateBridgeFee(address receiver, uint256 amount, uint64 destChainSelector) external view returns (uint256) {
        require(supportedChains[destChainSelector], "UnsupportedChain");

        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(bnm),
            amount: amount
        });

        // Using manual encoding for EVMExtraArgsV1 structure
        bytes memory extraArgs = abi.encodeWithSelector(
            bytes4(keccak256("EVMExtraArgsV1")),
            200_000 // gasLimit
        );

        bytes memory encodedReceiver = abi.encode(receiver);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: encodedReceiver,
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: extraArgs,
            feeToken: address(0)
        });

        return router.getFee(destChainSelector, message);
    }

    // Admin functions
    function setChainSupport(uint64 chainSelector, bool supported) external onlyOwner {
        supportedChains[chainSelector] = supported;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
