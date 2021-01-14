// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

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
    event StepProofCreated(uint256 _id, string _hash);

    /// @notice Notarizes a supply chain Step Proof
    /// @param _hashOfJson The hash proof of the JSON file
    /// @return The numeric ID of the Step proof
    function createStepProof(string calldata _hashOfJson)
        external
        onlyOwner
        returns (uint256 stepID)
    {
        Step memory newStep = Step(now, _hashOfJson);
        stepsCounter = stepsCounter.add(1);
        stepIdToStepInfo[stepsCounter] = newStep;
        emit StepProofCreated(stepsCounter, _hashOfJson);
        return stepsCounter;
    }

    /// @notice Get the Step Info by a given array id
    /// @param _id The numeric id of the Step in the array
    /// @return the Step Info
    function getStepProofInfo(uint256 _id)
        external
        view
        returns (
            uint256 createdAt,
            string memory hashOfJson
        )
    {
        return (
            stepIdToStepInfo[_id].createdAt,
            stepIdToStepInfo[_id].hashOfJson
        );
    }
}
