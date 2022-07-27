// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.15;

import "forge-std/Test.sol";

import "../src/Devoleum.sol";

contract DevoleumTest is Test {
    Devoleum d;

    function setUp() public {
        d = new Devoleum();
    }
}
