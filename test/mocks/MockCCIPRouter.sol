// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract MockCCIPRouter is IRouterClient {
    uint256 private mockFee = 0.01 ether;
    address private lastSender;
    Client.EVM2AnyMessage private lastMessage;
    uint64 private lastDestinationChain;
    
    event MessageSent(address indexed sender, uint64 indexed destinationChain, Client.EVM2AnyMessage message);
    
    function setMockFee(uint256 fee) external {
        mockFee = fee;
    }
    
    function getFee(
        uint64, /* destinationChain */
        Client.EVM2AnyMessage memory message
    ) external view override returns (uint256 fee) {
        // In a real implementation, the fee would depend on the message complexity
        // For testing, we just return a fixed fee
        return mockFee;
    }
    
    function ccipSend(
        uint64 destinationChain,
        Client.EVM2AnyMessage memory message
    ) external payable override returns (bytes32 messageId) {
        lastSender = msg.sender;
        lastMessage = message;
        lastDestinationChain = destinationChain;
        
        emit MessageSent(msg.sender, destinationChain, message);
        
        // Return a deterministic message ID for testing
        return keccak256(abi.encodePacked(msg.sender, destinationChain, block.timestamp));
    }
    
    function simulateCCIPReceive(address bridgeAddress, Client.Any2EVMMessage memory message) external {
        // Simulate the CCIP router calling the bridge's _ccipReceive function
        (bool success, ) = bridgeAddress.call(
            abi.encodeWithSignature("_ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))", message)
        );
        
        require(success, "CCIP receive simulation failed");
    }
    
    function getLastSender() external view returns (address) {
        return lastSender;
    }
    
    function getLastMessage() external view returns (Client.EVM2AnyMessage memory) {
        return lastMessage;
    }
    
    function getLastDestinationChain() external view returns (uint64) {
        return lastDestinationChain;
    }
    
    // Required interface functions that we don't need for testing
    function isChainSupported(uint64) external pure override returns (bool) {
        return true;
    }
    
    function getSupportedTokens(uint64) external pure override returns (address[] memory) {
        return new address[](0);
    }
}
