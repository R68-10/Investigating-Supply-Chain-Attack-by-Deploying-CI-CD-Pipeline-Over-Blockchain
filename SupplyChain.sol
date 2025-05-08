// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    struct PushEvent {
        string developerID;
        uint256 timestamp;
        string commitHash;
        string changes;
    }

    struct BuildEvent {
        string jobID;
        uint256 timestamp;
        string status;
    }

    struct TestEvent {
        string jobID;
        uint256 timestamp;
        string status;
    }

    struct DeployEvent {
        string jobID;
        uint256 timestamp;
        string status;
    }

    mapping(bytes32 => PushEvent) public pushes;
    mapping(bytes32 => BuildEvent) public builds;
    mapping(bytes32 => TestEvent) public tests;
    mapping(bytes32 => DeployEvent) public deployments;

    event PushLogged(string indexed developerID, string commitHash, uint256 timestamp, string changes);
    event BuildLogged(string indexed jobID, uint256 timestamp, string status);
    event TestLogged(string indexed jobID, uint256 timestamp, string status);
    event DeployLogged(string indexed jobID, uint256 timestamp, string status);

    bytes32 private giteaTokenHash;
    bytes32 private jenkinsTokenHash;

    constructor() {
        giteaTokenHash = hex"a4ccd2e6787f581c145c400bcdd992cf3a468bf122fe38d7b95a7f8c1e18c0f4";
        jenkinsTokenHash = hex"067dcb241470ac779579ba59f3015a67d612cbe288dbb6109dbc384dc8e870d3";
    }

    modifier onlyGitea(string memory providedToken) {
        require(keccak256(abi.encodePacked(providedToken)) == giteaTokenHash, "Invalid Gitea token");
        _;
    }

    modifier onlyJenkins(string memory providedToken) {
        require(keccak256(abi.encodePacked(providedToken)) == jenkinsTokenHash, "Invalid Jenkins token");
        _;
    }

    function logPush(
        string memory providedToken,
        string memory developerID,
        string memory commitHash,
        string memory changes
    ) public onlyGitea(providedToken) {
        uint256 timestamp = block.timestamp;
        bytes32 commitKey = keccak256(abi.encodePacked(commitHash));
        pushes[commitKey] = PushEvent(developerID, timestamp, commitHash, changes);
        emit PushLogged(developerID, commitHash, timestamp, changes);
    }

    function logBuild(
        string memory providedToken,
        string memory jobID,
        string memory status
    ) public onlyJenkins(providedToken) {
        uint256 timestamp = block.timestamp;
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        builds[jobKey] = BuildEvent(jobID, timestamp, status);
        emit BuildLogged(jobID, timestamp, status);
    }

    function logTest(
        string memory providedToken,
        string memory jobID,
        string memory status
    ) public onlyJenkins(providedToken) {
        uint256 timestamp = block.timestamp;
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        tests[jobKey] = TestEvent(jobID, timestamp, status);
        emit TestLogged(jobID, timestamp, status);
    }

    function logDeploy(
        string memory providedToken,
        string memory jobID,
        string memory status
    ) public onlyJenkins(providedToken) {
        uint256 timestamp = block.timestamp;
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        deployments[jobKey] = DeployEvent(jobID, timestamp, status);
        emit DeployLogged(jobID, timestamp, status);
    }

    function getPushDetails(string memory commitHash) public view returns (PushEvent memory) {
        bytes32 commitKey = keccak256(abi.encodePacked(commitHash));
        return pushes[commitKey];
    }

    function getBuildDetails(string memory jobID) public view returns (BuildEvent memory) {
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        return builds[jobKey];
    }

    function getTestDetails(string memory jobID) public view returns (TestEvent memory) {
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        return tests[jobKey];
    }

    function getDeployDetails(string memory jobID) public view returns (DeployEvent memory) {
        bytes32 jobKey = keccak256(abi.encodePacked(jobID));
        return deployments[jobKey];
    }
}
