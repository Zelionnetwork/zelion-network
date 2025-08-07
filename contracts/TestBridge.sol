// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./overrides/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./interfaces/IZYLToken.sol";

contract TestBridge is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    address public s_router;

    modifier onlyRouter() {
        require(msg.sender == s_router, "Only router can call this function");
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(address router) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        s_router = router;
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external onlyRouter {
        // Test implementation
    }
}
