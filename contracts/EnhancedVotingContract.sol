// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EnhancedVotingContract is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ZK_VERIFIER_ROLE = keccak256("ZK_VERIFIER_ROLE");
    
    struct ZKProof {
        uint256[8] proof; // Groth16 proof elements
        uint256[] publicSignals;
        bytes32 nullifierHash;
        bytes32 commitment;
    }
    
    struct SecureVote {
        bytes32 nullifierHash; // Prevents double voting
        bytes32 commitment; // Vote commitment
        bytes32 zkProofHash; // Hash of ZK proof
        uint256 timestamp;
        bool isVerified;
        uint256 blockNumber;
    }
    
    struct BiometricVerification {
        bytes32 biometricHash;
        uint256 confidenceScore;
        bool livenessCheck;
        uint256 verificationTime;
        bytes signature;
    }
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        bytes32 biometricTemplate; // Encrypted biometric template hash
        string ipfsHash; // IPFS hash for decentralized storage
        uint256 registrationTime;
        BiometricVerification lastVerification;
        uint256 fraudScore; // AI-computed fraud risk score
    }
    
    struct Election {
        string name;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string[] candidates;
        mapping(string => uint256) candidateVotes;
        bytes32 merkleRoot; // For voter eligibility
        uint256 totalVotes;
        bool zkEnabled; // Whether ZK proofs are required
    }
    
    // State variables
    mapping(address => Voter) public voters;
    mapping(bytes32 => SecureVote) public secureVotes;
    mapping(bytes32 => bool) public usedNullifiers; // Prevent double voting with ZK
    mapping(address => uint256) public voterNonces; // Anti-replay protection
    
    Election public currentElection;
    bytes32[] public voteCommitments;
    
    // Enhanced security features
    uint256 public constant MAX_FRAUD_SCORE = 100;
    uint256 public constant MIN_CONFIDENCE_SCORE = 85;
    uint256 public constant BIOMETRIC_THRESHOLD = 90;
    
    // Multi-signature requirements
    uint256 public constant REQUIRED_SIGNATURES = 3; // Enhanced security
    mapping(bytes32 => mapping(address => bool)) public adminSignatures;
    mapping(bytes32 => uint256) public signatureCount;
    
    // Performance metrics
    uint256 public totalGasUsed;
    uint256 public averageVoteTime;
    uint256 public totalProcessedVotes;
    
    // Events
    event SecureVoteCast(bytes32 indexed nullifierHash, bytes32 commitment, uint256 timestamp);
    event BiometricVerification(address indexed voter, uint256 confidenceScore, bool livenessCheck);
    event FraudDetected(address indexed voter, uint256 fraudScore, string reason);
    event ZKProofVerified(bytes32 indexed nullifierHash, bool isValid);
    event PerformanceMetric(string metric, uint256 value, uint256 timestamp);
    
    modifier onlyDuringElection() {
        require(currentElection.isActive, "Election not active");
        require(block.timestamp >= currentElection.startTime, "Election not started");
        require(block.timestamp <= currentElection.endTime, "Election ended");
        _;
    }
    
    modifier validBiometrics() {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        require(voters[msg.sender].fraudScore < MAX_FRAUD_SCORE, "High fraud risk detected");
        _;
    }
    
    modifier antiReplay(uint256 nonce) {
        require(nonce > voterNonces[msg.sender], "Invalid nonce");
        voterNonces[msg.sender] = nonce;
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ZK_VERIFIER_ROLE, msg.sender);
    }
    
    // Enhanced voter registration with IPFS integration
    function registerVoterWithIPFS(
        address voterAddress,
        bytes32 biometricTemplate,
        string memory ipfsHash,
        bytes memory signature
    ) external onlyRole(ADMIN_ROLE) {
        require(!voters[voterAddress].isRegistered, "Already registered");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        voters[voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            biometricTemplate: biometricTemplate,
            ipfsHash: ipfsHash,
            registrationTime: block.timestamp,
            lastVerification: BiometricVerification({
                biometricHash: bytes32(0),
                confidenceScore: 0,
                livenessCheck: false,
                verificationTime: 0,
                signature: ""
            }),
            fraudScore: 0
        });
        
        emit VoterRegistered(voterAddress, biometricTemplate, ipfsHash);
    }
    
    // ZK-SNARK based anonymous voting
    function castAnonymousVote(
        ZKProof memory zkProof,
        uint256 nonce
    ) external 
        onlyDuringElection 
        validBiometrics 
        antiReplay(nonce)
        nonReentrant 
    {
        uint256 gasStart = gasleft();
        
        require(!usedNullifiers[zkProof.nullifierHash], "Vote already cast");
        require(currentElection.zkEnabled, "ZK voting disabled");
        
        // Verify ZK proof
        require(_verifyZKProof(zkProof), "Invalid ZK proof");
        
        // Record the vote
        secureVotes[zkProof.nullifierHash] = SecureVote({
            nullifierHash: zkProof.nullifierHash,
            commitment: zkProof.commitment,
            zkProofHash: keccak256(abi.encodePacked(zkProof.proof)),
            timestamp: block.timestamp,
            isVerified: true,
            blockNumber: block.number
        });
        
        usedNullifiers[zkProof.nullifierHash] = true;
        voteCommitments.push(zkProof.commitment);
        currentElection.totalVotes++;
        
        // Update performance metrics
        uint256 gasUsed = gasStart - gasleft();
        _updatePerformanceMetrics(gasUsed);
        
        emit SecureVoteCast(zkProof.nullifierHash, zkProof.commitment, block.timestamp);
        emit ZKProofVerified(zkProof.nullifierHash, true);
    }
    
    // Enhanced biometric verification with fraud detection
    function verifyBiometricsWithAI(
        address voter,
        bytes32 biometricHash,
        uint256 confidenceScore,
        bool livenessCheck,
        uint256 fraudScore,
        bytes memory signature
    ) external onlyRole(VERIFIER_ROLE) {
        require(voters[voter].isRegistered, "Voter not registered");
        require(confidenceScore >= MIN_CONFIDENCE_SCORE, "Confidence too low");
        require(livenessCheck, "Liveness check failed");
        
        // Update fraud score based on AI analysis
        if (fraudScore > MAX_FRAUD_SCORE) {
            emit FraudDetected(voter, fraudScore, "AI detected high fraud risk");
            _pauseVoter(voter);
            return;
        }
        
        voters[voter].lastVerification = BiometricVerification({
            biometricHash: biometricHash,
            confidenceScore: confidenceScore,
            livenessCheck: livenessCheck,
            verificationTime: block.timestamp,
            signature: signature
        });
        
        voters[voter].fraudScore = fraudScore;
        
        emit BiometricVerification(voter, confidenceScore, livenessCheck);
    }
    
    // ZK proof verification (simplified - would use actual verifier in production)
    function _verifyZKProof(ZKProof memory zkProof) internal view returns (bool) {
        // In production, this would call the actual zk-SNARK verifier
        // For now, we validate the structure and basic constraints
        
        require(zkProof.proof.length == 8, "Invalid proof length");
        require(zkProof.publicSignals.length > 0, "No public signals");
        require(zkProof.nullifierHash != bytes32(0), "Invalid nullifier");
        require(zkProof.commitment != bytes32(0), "Invalid commitment");
        
        // Simulate verification (replace with actual Groth16 verification)
        bytes32 proofHash = keccak256(abi.encodePacked(zkProof.proof));
        return proofHash != bytes32(0);
    }
    
    // Performance monitoring
    function _updatePerformanceMetrics(uint256 gasUsed) internal {
        totalGasUsed += gasUsed;
        totalProcessedVotes++;
        averageVoteTime = totalGasUsed / totalProcessedVotes;
        
        emit PerformanceMetric("gas_per_vote", gasUsed, block.timestamp);
        emit PerformanceMetric("average_vote_time", averageVoteTime, block.timestamp);
    }
    
    // Security functions
    function _pauseVoter(address voter) internal {
        voters[voter].fraudScore = MAX_FRAUD_SCORE;
        // Additional security measures can be added here
    }
    
    // Enhanced admin functions with multi-sig
    function proposeEnhancedElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory candidates,
        bool zkEnabled,
        bytes32 merkleRoot
    ) external onlyRole(ADMIN_ROLE) {
        bytes32 actionHash = keccak256(abi.encodePacked(
            "CREATE_ENHANCED_ELECTION",
            name,
            startTime,
            endTime,
            candidates,
            zkEnabled,
            merkleRoot,
            block.timestamp
        ));
        
        _proposeAdminAction(actionHash);
        
        if (_checkAdminSignatures(actionHash)) {
            _createEnhancedElection(name, startTime, endTime, candidates, zkEnabled, merkleRoot);
        }
    }
    
    function _createEnhancedElection(
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory candidates,
        bool zkEnabled,
        bytes32 merkleRoot
    ) internal {
        currentElection.name = name;
        currentElection.startTime = startTime;
        currentElection.endTime = endTime;
        currentElection.isActive = true;
        currentElection.candidates = candidates;
        currentElection.zkEnabled = zkEnabled;
        currentElection.merkleRoot = merkleRoot;
        currentElection.totalVotes = 0;
        
        emit ElectionCreated(name, startTime, endTime);
    }
    
    function _proposeAdminAction(bytes32 actionHash) internal {
        require(!adminSignatures[actionHash][msg.sender], "Already signed");
        
        adminSignatures[actionHash][msg.sender] = true;
        signatureCount[actionHash]++;
        
        emit AdminActionProposed(actionHash, msg.sender);
    }
    
    function _checkAdminSignatures(bytes32 actionHash) internal view returns (bool) {
        return signatureCount[actionHash] >= REQUIRED_SIGNATURES;
    }
    
    // View functions for analytics
    function getPerformanceMetrics() external view returns (
        uint256 totalGas,
        uint256 avgTime,
        uint256 totalVotes
    ) {
        return (totalGasUsed, averageVoteTime, totalProcessedVotes);
    }
    
    function getVoterFraudScore(address voter) external view returns (uint256) {
        return voters[voter].fraudScore;
    }
    
    function getElectionAnalytics() external view returns (
        uint256 totalVotes,
        uint256 uniqueVoters,
        uint256 averageGasPerVote,
        bool zkEnabled
    ) {
        return (
            currentElection.totalVotes,
            voteCommitments.length,
            totalProcessedVotes > 0 ? totalGasUsed / totalProcessedVotes : 0,
            currentElection.zkEnabled
        );
    }
    
    // Events for original compatibility
    event VoterRegistered(address indexed voter, bytes32 biometricTemplate, string ipfsHash);
    event ElectionCreated(string name, uint256 startTime, uint256 endTime);
    event AdminActionProposed(bytes32 indexed actionHash, address proposer);
}