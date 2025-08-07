// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./overrides/CCIPReceiver.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract MinimalBridge is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    function initialize() external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
    }
}
