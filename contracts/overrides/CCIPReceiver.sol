// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

abstract contract CCIPReceiver is IERC165 {
    IRouterClient private s_router;

    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address sender, string text);

    constructor(address router) {
        s_router = IRouterClient(router);
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal virtual {}

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(CCIPReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function getRouter() public view returns (address) {
        return address(s_router);
    }
}
