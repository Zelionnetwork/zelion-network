// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract OZTest is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    function initialize() external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
    }
}
