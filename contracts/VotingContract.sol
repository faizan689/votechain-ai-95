// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VotingContract is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct Vote {
        address voter;
        string partyId;
        string partyName;
        bytes32 voteHash;
        uint256 timestamp;
        bool verified;
    }
    
    struct Election {
        string name;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string[] partyIds;
        mapping(string => string) partyNames;
        mapping(string => uint256) voteCounts;
    }
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        bytes32 faceHash;
        string phoneNumber;
        uint256 registrationTime;
    }
    
    mapping(address => Voter) public voters;
    mapping(bytes32 => Vote) public votes;
    mapping(address => bool) public authorizedVerifiers;
    
    Election public currentElection;
    bytes32[] public voteHashes;
    
    uint256 public totalVotes;
    uint256 public totalRegisteredVoters;
    
    // Multi-signature requirements
    uint256 public constant REQUIRED_SIGNATURES = 2;
    mapping(bytes32 => mapping(address => bool)) public adminSignatures;
    mapping(bytes32 => uint256) public signatureCount;
    
    event VoterRegistered(address indexed voter, bytes32 faceHash, string phoneNumber);
    event VoteCast(address indexed voter, string partyId, bytes32 voteHash, uint256 timestamp);
    event ElectionCreated(string name, uint256 startTime, uint256 endTime);
    event ElectionStatusChanged(bool isActive);
    event VoteVerified(bytes32 indexed voteHash, address verifier);
    event AdminActionProposed(bytes32 indexed actionHash, address proposer);
    event AdminActionExecuted(bytes32 indexed actionHash);
    
    modifier onlyDuringElection() {
        require(currentElection.isActive, "Election is not active");
        require(block.timestamp >= currentElection.startTime, "Election has not started");
        require(block.timestamp <= currentElection.endTime, "Election has ended");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        _;
    }
    
    modifier hasNotVoted() {
        require(!voters[msg.sender].hasVoted, "Voter has already voted");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        totalRegisteredVoters = 0;
        totalVotes = 0;
    }
    
    // Voter registration with biometric hash
    function registerVoter(
        address voterAddress,
        bytes32 faceHash,
        string memory phoneNumber
    ) external onlyRole(ADMIN_ROLE) {
        require(!voters[voterAddress].isRegistered, "Voter already registered");
        
        voters[voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            faceHash: faceHash,
            phoneNumber: phoneNumber,
            registrationTime: block.timestamp
        });
        
        totalRegisteredVoters++;
        emit VoterRegistered(voterAddress, faceHash, phoneNumber);
    }
    
    // Cast vote with biometric verification
    function castVote(
        string memory partyId,
        string memory partyName,
        bytes32 voteHash,
        bytes32 biometricHash
    ) external 
        onlyDuringElection 
        onlyRegisteredVoter 
        hasNotVoted 
        nonReentrant 
    {
        require(bytes(partyId).length > 0, "Party ID required");
        require(voters[msg.sender].faceHash == biometricHash, "Biometric verification failed");
        
        votes[voteHash] = Vote({
            voter: msg.sender,
            partyId: partyId,
            partyName: partyName,
            voteHash: voteHash,
            timestamp: block.timestamp,
            verified: true
        });
        
        voters[msg.sender].hasVoted = true;
        voteHashes.push(voteHash);
        currentElection.voteCounts[partyId]++;
        totalVotes++;
        
        emit VoteCast(msg.sender, partyId, voteHash, block.timestamp);
    }
    
    // Create new election (multi-sig required)
    function proposeElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory partyIds,
        string[] memory partyNames
    ) external onlyRole(ADMIN_ROLE) {
        require(startTime > block.timestamp, "Start time must be in future");
        require(endTime > startTime, "End time must be after start time");
        require(partyIds.length == partyNames.length, "Party arrays length mismatch");
        
        bytes32 actionHash = keccak256(abi.encodePacked(
            "CREATE_ELECTION",
            name,
            startTime,
            endTime,
            partyIds,
            partyNames,
            block.timestamp
        ));
        
        _proposeAdminAction(actionHash);
        
        if (_checkAdminSignatures(actionHash)) {
            _createElection(name, startTime, endTime, partyIds, partyNames);
            emit AdminActionExecuted(actionHash);
        }
    }
    
    function _createElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory partyIds,
        string[] memory partyNames
    ) internal {
        currentElection.name = name;
        currentElection.startTime = startTime;
        currentElection.endTime = endTime;
        currentElection.isActive = true;
        currentElection.partyIds = partyIds;
        
        for (uint i = 0; i < partyIds.length; i++) {
            currentElection.partyNames[partyIds[i]] = partyNames[i];
            currentElection.voteCounts[partyIds[i]] = 0;
        }
        
        emit ElectionCreated(name, startTime, endTime);
    }
    
    // Multi-signature admin functions
    function _proposeAdminAction(bytes32 actionHash) internal {
        require(!adminSignatures[actionHash][msg.sender], "Already signed this action");
        
        adminSignatures[actionHash][msg.sender] = true;
        signatureCount[actionHash]++;
        
        emit AdminActionProposed(actionHash, msg.sender);
    }
    
    function signAdminAction(bytes32 actionHash) external onlyRole(ADMIN_ROLE) {
        require(!adminSignatures[actionHash][msg.sender], "Already signed");
        
        adminSignatures[actionHash][msg.sender] = true;
        signatureCount[actionHash]++;
        
        if (signatureCount[actionHash] >= REQUIRED_SIGNATURES) {
            emit AdminActionExecuted(actionHash);
        }
    }
    
    function _checkAdminSignatures(bytes32 actionHash) internal view returns (bool) {
        return signatureCount[actionHash] >= REQUIRED_SIGNATURES;
    }
    
    // Toggle election status (multi-sig required)
    function proposeToggleElection() external onlyRole(ADMIN_ROLE) {
        bytes32 actionHash = keccak256(abi.encodePacked(
            "TOGGLE_ELECTION",
            currentElection.isActive,
            block.timestamp
        ));
        
        _proposeAdminAction(actionHash);
        
        if (_checkAdminSignatures(actionHash)) {
            currentElection.isActive = !currentElection.isActive;
            emit ElectionStatusChanged(currentElection.isActive);
            emit AdminActionExecuted(actionHash);
        }
    }
    
    // Emergency pause (multi-sig required)
    function proposePause() external onlyRole(ADMIN_ROLE) {
        bytes32 actionHash = keccak256(abi.encodePacked("PAUSE", block.timestamp));
        _proposeAdminAction(actionHash);
        
        if (_checkAdminSignatures(actionHash)) {
            _pause();
            emit AdminActionExecuted(actionHash);
        }
    }
    
    function proposeUnpause() external onlyRole(ADMIN_ROLE) {
        bytes32 actionHash = keccak256(abi.encodePacked("UNPAUSE", block.timestamp));
        _proposeAdminAction(actionHash);
        
        if (_checkAdminSignatures(actionHash)) {
            _unpause();
            emit AdminActionExecuted(actionHash);
        }
    }
    
    // View functions
    function getElectionInfo() external view returns (
        string memory name,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        string[] memory partyIds
    ) {
        return (
            currentElection.name,
            currentElection.startTime,
            currentElection.endTime,
            currentElection.isActive,
            currentElection.partyIds
        );
    }
    
    function getVoteCount(string memory partyId) external view returns (uint256) {
        return currentElection.voteCounts[partyId];
    }
    
    function getPartyName(string memory partyId) external view returns (string memory) {
        return currentElection.partyNames[partyId];
    }
    
    function getVoterInfo(address voterAddress) external view returns (
        bool isRegistered,
        bool hasVoted,
        uint256 registrationTime
    ) {
        Voter memory voter = voters[voterAddress];
        return (voter.isRegistered, voter.hasVoted, voter.registrationTime);
    }
    
    function getVoteByHash(bytes32 voteHash) external view returns (
        address voter,
        string memory partyId,
        string memory partyName,
        uint256 timestamp,
        bool verified
    ) {
        Vote memory vote = votes[voteHash];
        return (vote.voter, vote.partyId, vote.partyName, vote.timestamp, vote.verified);
    }
    
    function getTotalVotes() external view returns (uint256) {
        return totalVotes;
    }
    
    function getTotalRegisteredVoters() external view returns (uint256) {
        return totalRegisteredVoters;
    }
    
    function getAllVoteHashes() external view returns (bytes32[] memory) {
        return voteHashes;
    }
    
    // Verify vote existence
    function verifyVote(bytes32 voteHash) external view returns (bool exists, bool verified) {
        Vote memory vote = votes[voteHash];
        return (vote.timestamp > 0, vote.verified);
    }
}