// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/// @title Devoleum
/// @author Lorenzo Zaccagnini Elisa Romondia
/// @notice You can use this contract for your JSONs notarization
/// @dev All function calls are currently implemented without side effects
contract Devoleum is Ownable, Pausable {
    using SafeMath for uint256;

    //STRUCTS

    struct User {
        uint256 createdAt;
        string mongoID;
        address owner;
    }

    struct Step {
        uint256 createdAt;
        string mongoID;
        address owner;
        string hashOfJson;

    }

    //COUNTERS
    uint256 private stepsCounter = 0;

    //STRUCT MAPPINGS
    mapping(address => User) public addressToUser;
    mapping(uint256 => Step) public stepIdToStepInfo;

    //PERMISSION
    mapping(address => bool) public userPermission;

    constructor() internal {
        userPermission[owner()] = true;
    }


    /// @notice Toggle User permission for write ops in this smart contract
    /// @param _permission Toggle permission
    /// @param _target The target address
    function toggleUserPermission(bool _permission, address _target)
        external
        onlyOwner()
    {
        userPermission[_target] = _permission;
    }

    modifier isSignupPermissioned() {
        require(
            userPermission[msg.sender] == true,
            "you are not allowed to use this smart contract"
        );
        _;
    }

    modifier isUserEnabled() {
        require(userPermission[msg.sender] == true, "user not allowed");
        require(addressToUser[msg.sender].createdAt != 0, "user not existent");
        _;
    }

    modifier isUserNotExistent() {
        require(
            addressToUser[msg.sender].createdAt == 0,
            "Duplicates not allowed"
        );
        _;
    }

    //LISTS
    address[] public usersList;

    function getUsersList() external view returns (address[] memory) {
        return usersList;
    }

    event UserCreated(address _owner);

    /// @notice Creates a User profile
    /// @param _mongoID The ID that refers to Devoleum Mongo DB
    function createUser(string calldata _mongoID)
        external
        isSignupPermissioned
        isUserNotExistent
        whenNotPaused
    {
        User memory newUser = User(now, _mongoID, msg.sender);
        addressToUser[msg.sender] = newUser;
        userPermission[msg.sender] = true;
        usersList.push(msg.sender);
        emit UserCreated(msg.sender);
    }

    event StepCreated(address _owner, uint256 _id);

    /// @notice Notarizes a Step Proof
    /// @param _hashOfJson The hash proof of the linked JSON file
    /// @param _mongoID The ID that refers to Devoleum Mongo DB
    /// @return The numeric ID of the Step proof
    function createStep(string calldata _hashOfJson, string calldata _mongoID)
        external
        isUserEnabled
        whenNotPaused
        returns (uint256 stepID)
    {
        Step memory newStep =
            Step(now, _mongoID, msg.sender, _hashOfJson);
        stepsCounter = stepsCounter.add(1);
        stepIdToStepInfo[stepsCounter] = newStep;
        emit StepCreated(msg.sender, stepsCounter);
        return stepsCounter;
    }

    function getUserInfo(address _userAdr)
        external
        view
        returns (
            uint256 createdAt,
            string memory mongoID,
            address owner
        )
    {
        return (
            addressToUser[_userAdr].createdAt,
            addressToUser[_userAdr].mongoID,
            addressToUser[_userAdr].owner
        );
    }

    /// @notice Get the Step Info by a given ID
    /// @param _id The numeric ID of the Step
    /// @return the Step Info
    function getStepInfo(uint256 _id)
        external
        view
        returns (
            uint256 createdAt,
            string memory mongoID,
            address userAdr,
            string memory hashOfJson
        )
    {
        return (
            stepIdToStepInfo[_id].createdAt,
            stepIdToStepInfo[_id].mongoID,
            stepIdToStepInfo[_id].owner,
            stepIdToStepInfo[_id].hashOfJson
        );
    }
}
