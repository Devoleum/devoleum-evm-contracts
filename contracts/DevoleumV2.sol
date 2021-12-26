// SPDX-License-Identifier: MIT
pragma solidity >=0.8.00 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/// @title Devoleum
/// @author Lorenzo Zaccagnini Elisa Romondia
/// @notice You can use this contract for your JSONs notarization
/// @dev All function calls are currently implemented without side effects
contract Devoleum is Ownable {
    using SafeMath for uint256;

    struct Step {
        uint256 createdAt;
        string hashOfJson;
    }

    //COUNTERS
    uint256 public stepsCounter = 0;

    //STRUCT MAPPINGS
    mapping(uint256 => Step) public stepIdToStepInfo;
    mapping(string => uint256) public hashToId;
    event StepProofCreated(uint256 _id, string _hash);

    //Modifiers
    modifier noDuplicate(string memory _hashOfJson) {
        require(hashToId[_hashOfJson] == 0, "duplicate");
        _;
    }

    /// @notice Notarizes a supply chain Step Proof
    /// @param _hashOfJson The hash proof of the JSON file
    /// @return stepID The numeric ID of the Step proof
    function createStepProof(string calldata _hashOfJson)
        external
        onlyOwner
        noDuplicate(_hashOfJson)
        returns (uint256 stepID)
    {
        Step memory newStep = Step(block.timestamp, _hashOfJson);
        stepsCounter = stepsCounter.add(1);
        stepIdToStepInfo[stepsCounter] = newStep;
        hashToId[_hashOfJson] = stepsCounter;
        emit StepProofCreated(stepsCounter, _hashOfJson);
        return stepsCounter;
    }
}
