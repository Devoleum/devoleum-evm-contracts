// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../src/DevoleumV2.sol";

contract DevoleumTest is Test {
    Devoleum d;

    function setUp() public {
        d = new Devoleum();
    }

    function testStepsCounter() public {
        assertEq(d.stepsCounter(), 0);
    }
}
