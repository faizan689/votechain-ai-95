# VoteGuard Blockchain Deployment Guide

## Quick Start - Free Deployment on Sepolia Testnet

Follow these steps to deploy your VoteGuard smart contract on Ethereum Sepolia Testnet for FREE:

### 1. Prerequisites
- MetaMask wallet installed
- Get free Sepolia ETH from faucet
- Infura or Alchemy API key (free tier)

### 2. Get Free Test ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request 0.1 SEP (enough for deployment and testing)

### 3. Setup Environment
1. Navigate to `contracts/` directory
2. Copy `.env.example` to `.env`
3. Fill in your details:

```env
ETHEREUM_PRIVATE_KEY=your_metamask_private_key_without_0x
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

### 4. Deploy Smart Contract
```bash
cd contracts
npm install
npm run compile
npm run deploy
```

### 5. Update Frontend Configuration
After deployment, the contract address will be automatically saved to `public/contract-deployment.json`.

### 6. Test Your Blockchain Voting
1. Connect MetaMask to Sepolia testnet
2. Visit `/blockchain` page in your app
3. Connect wallet and test voting functionality

## Network Details

### Sepolia Testnet (FREE)
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/
- **Gas Cost**: FREE (test ETH)

## Smart Contract Features

### ✅ Implemented Features
- **Biometric Voter Registration**: Secure face hash storage
- **One Person, One Vote**: Blockchain-enforced voting limits
- **Multi-Signature Admin**: Requires multiple admin approvals
- **Immutable Vote Records**: Permanent blockchain storage
- **Real-time Events**: Live vote monitoring
- **Emergency Controls**: Pause/unpause functionality

### 🔐 Security Features
- Access control with role-based permissions
- Reentrancy protection on all functions
- Multi-signature requirements for admin actions
- Biometric hash verification for vote casting
- Emergency pause for security incidents

## Troubleshooting

### Common Issues
1. **Deployment fails**: Check you have enough Sepolia ETH
2. **MetaMask connection issues**: Switch to Sepolia network
3. **Contract not verified**: Run `npm run verify` after deployment
4. **Gas estimation errors**: Increase gas limit in hardhat.config.js

## Next Steps

1. **Test thoroughly** on Sepolia testnet
2. **Audit smart contract** before mainnet deployment
3. **Setup monitoring** for production use
4. **Configure backup systems** for high availability

## Support

For deployment support:
- Check console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure sufficient test ETH in your wallet
- Test with smaller transactions first

**Important**: This is a testnet deployment. For production use, additional security audits and mainnet deployment are required.