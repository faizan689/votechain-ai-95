# VoteGuard Smart Contracts

This directory contains the Solidity smart contracts for the VoteGuard blockchain voting system running on Ethereum Sepolia Testnet.

## Quick Start

### Prerequisites
- Node.js v16+
- NPM or Yarn
- MetaMask wallet with Sepolia ETH

### Setup
```bash
cd contracts
npm install
```

### Environment Variables
Create a `.env` file in the contracts directory:
```env
ETHEREUM_PRIVATE_KEY=your_private_key_here
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deployment Commands
```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy

# Verify contract on Etherscan
npm run verify
```

## Contract Features

### VotingContract.sol
- **Biometric Voter Registration**: Secure voter registration with face hash verification
- **Secure Vote Casting**: One person, one vote with biometric verification
- **Multi-Signature Admin**: Requires multiple admin signatures for critical operations
- **Immutable Records**: All votes permanently stored on blockchain
- **Real-time Monitoring**: Events for live vote tracking
- **Emergency Controls**: Pause functionality for security

### Key Functions
- `registerVoter()`: Register a voter with biometric data
- `castVote()`: Cast a vote with biometric verification
- `proposeElection()`: Create new election (multi-sig required)
- `getElectionInfo()`: Get current election details
- `getTotalVotes()`: Get total vote count
- `verifyVote()`: Verify vote existence and authenticity

### Security Features
- Access control with role-based permissions
- Reentrancy protection
- Emergency pause functionality
- Multi-signature requirements for admin actions
- Biometric hash verification for votes

## Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

## Getting Test ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request test ETH for deployment and transactions

## Contract Verification
After deployment, verify your contract on Etherscan:
```bash
npm run verify
```

This makes the contract source code publicly viewable and enables better interaction with the contract.

## Integration
The deployed contract address is automatically saved to `../public/contract-deployment.json` and integrated with the frontend application.