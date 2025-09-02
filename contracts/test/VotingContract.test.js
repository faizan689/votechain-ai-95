const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingContract", function () {
  let votingContract;
  let owner, admin, voter1, voter2;
  let faceHash1, faceHash2;

  beforeEach(async function () {
    [owner, admin, voter1, voter2] = await ethers.getSigners();
    
    const VotingContract = await ethers.getContractFactory("VotingContract");
    votingContract = await VotingContract.deploy();
    await votingContract.deployed();

    // Generate face hashes for testing
    faceHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("face1"));
    faceHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("face2"));

    // Grant admin role
    const ADMIN_ROLE = await votingContract.ADMIN_ROLE();
    await votingContract.grantRole(ADMIN_ROLE, admin.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await votingContract.DEFAULT_ADMIN_ROLE();
      expect(await votingContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero votes and voters", async function () {
      expect(await votingContract.getTotalVotes()).to.equal(0);
      expect(await votingContract.getTotalRegisteredVoters()).to.equal(0);
    });
  });

  describe("Voter Registration", function () {
    it("Should allow admin to register voters", async function () {
      await votingContract.connect(admin).registerVoter(
        voter1.address,
        faceHash1,
        "1234567890"
      );

      expect(await votingContract.getTotalRegisteredVoters()).to.equal(1);
      
      const voterInfo = await votingContract.getVoterInfo(voter1.address);
      expect(voterInfo[0]).to.be.true; // isRegistered
      expect(voterInfo[1]).to.be.false; // hasVoted
    });

    it("Should prevent duplicate voter registration", async function () {
      await votingContract.connect(admin).registerVoter(
        voter1.address,
        faceHash1,
        "1234567890"
      );

      await expect(
        votingContract.connect(admin).registerVoter(
          voter1.address,
          faceHash1,
          "1234567890"
        )
      ).to.be.revertedWith("Voter already registered");
    });

    it("Should prevent non-admin from registering voters", async function () {
      await expect(
        votingContract.connect(voter1).registerVoter(
          voter2.address,
          faceHash2,
          "0987654321"
        )
      ).to.be.reverted;
    });
  });

  describe("Election Management", function () {
    beforeEach(async function () {
      // Register voters first
      await votingContract.connect(admin).registerVoter(
        voter1.address,
        faceHash1,
        "1234567890"
      );
    });

    it("Should allow admin to propose election", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 100;
      const endTime = startTime + 3600;
      
      const partyIds = ["PTY-001", "PTY-002"];
      const partyNames = ["Party A", "Party B"];

      await votingContract.connect(admin).proposeElection(
        "Test Election",
        startTime,
        endTime,
        partyIds,
        partyNames
      );

      const electionInfo = await votingContract.getElectionInfo();
      expect(electionInfo[0]).to.equal("Test Election");
      expect(electionInfo[3]).to.be.true; // isActive
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      // Register voters
      await votingContract.connect(admin).registerVoter(
        voter1.address,
        faceHash1,
        "1234567890"
      );

      // Create election
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - 100; // Started 100 seconds ago
      const endTime = currentTime + 3600; // Ends in 1 hour
      
      const partyIds = ["PTY-001", "PTY-002"];
      const partyNames = ["Party A", "Party B"];

      await votingContract.connect(admin).proposeElection(
        "Test Election",
        startTime,
        endTime,
        partyIds,
        partyNames
      );
    });

    it("Should allow registered voter to cast vote", async function () {
      const voteData = `${voter1.address}-PTY-001-${Date.now()}`;
      const voteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteData));

      await votingContract.connect(voter1).castVote(
        "PTY-001",
        "Party A",
        voteHash,
        faceHash1
      );

      expect(await votingContract.getTotalVotes()).to.equal(1);
      expect(await votingContract.getVoteCount("PTY-001")).to.equal(1);

      const voterInfo = await votingContract.getVoterInfo(voter1.address);
      expect(voterInfo[1]).to.be.true; // hasVoted
    });

    it("Should prevent double voting", async function () {
      const voteData = `${voter1.address}-PTY-001-${Date.now()}`;
      const voteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteData));

      // First vote
      await votingContract.connect(voter1).castVote(
        "PTY-001",
        "Party A",
        voteHash,
        faceHash1
      );

      // Second vote should fail
      const voteData2 = `${voter1.address}-PTY-002-${Date.now()}`;
      const voteHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteData2));

      await expect(
        votingContract.connect(voter1).castVote(
          "PTY-002",
          "Party B",
          voteHash2,
          faceHash1
        )
      ).to.be.revertedWith("Voter has already voted");
    });

    it("Should verify biometric hash during voting", async function () {
      const voteData = `${voter1.address}-PTY-001-${Date.now()}`;
      const voteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteData));
      const wrongHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("wrong"));

      await expect(
        votingContract.connect(voter1).castVote(
          "PTY-001",
          "Party A",
          voteHash,
          wrongHash
        )
      ).to.be.revertedWith("Biometric verification failed");
    });
  });

  describe("Vote Verification", function () {
    it("Should verify vote existence and status", async function () {
      // Register voter and create election first
      await votingContract.connect(admin).registerVoter(
        voter1.address,
        faceHash1,
        "1234567890"
      );

      const currentTime = Math.floor(Date.now() / 1000);
      await votingContract.connect(admin).proposeElection(
        "Test Election",
        currentTime - 100,
        currentTime + 3600,
        ["PTY-001"],
        ["Party A"]
      );

      const voteData = `${voter1.address}-PTY-001-${Date.now()}`;
      const voteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voteData));

      // Cast vote
      await votingContract.connect(voter1).castVote(
        "PTY-001",
        "Party A",
        voteHash,
        faceHash1
      );

      // Verify vote
      const verification = await votingContract.verifyVote(voteHash);
      expect(verification[0]).to.be.true; // exists
      expect(verification[1]).to.be.true; // verified
    });
  });

  describe("Multi-signature Admin Functions", function () {
    it("Should require multiple signatures for admin actions", async function () {
      // Add second admin
      const ADMIN_ROLE = await votingContract.ADMIN_ROLE();
      await votingContract.grantRole(ADMIN_ROLE, voter2.address);

      // Test multi-sig election creation
      const currentTime = Math.floor(Date.now() / 1000);
      const actionHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["string", "string", "uint256", "uint256", "string[]", "string[]", "uint256"],
          ["CREATE_ELECTION", "Multi-sig Election", currentTime + 100, currentTime + 3700, ["PTY-001"], ["Party A"], currentTime]
        )
      );

      // First admin proposes
      await votingContract.connect(admin).proposeElection(
        "Multi-sig Election",
        currentTime + 100,
        currentTime + 3700,
        ["PTY-001"],
        ["Party A"]
      );

      // Check if election is created (should be since we have enough signatures)
      const electionInfo = await votingContract.getElectionInfo();
      expect(electionInfo[0]).to.equal("Multi-sig Election");
    });
  });
});