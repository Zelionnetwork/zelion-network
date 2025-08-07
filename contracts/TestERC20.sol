// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestERC20 is ERC20, AccessControl {
    // This contract is just to test if basic OpenZeppelin imports work
    constructor() ERC20("Test", "TEST") {}
}
