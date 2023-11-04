// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Vault {    
    event AssetsReceived(address indexed sender, uint amount);
    event Log(address indexed sender);

    function emitLog() public payable{
        emit Log(msg.sender);
    }

    
    receive() external payable {
        emit AssetsReceived(msg.sender, msg.value);
    }

}