# VoteGuard Blockchain Deployment Guide 🚀

Complete step-by-step guide to deploy your VoteGuard blockchain voting system on Ethereum Sepolia Testnet.

## 🎯 Overview

This guide will help you deploy:
- ✅ Smart contracts on Ethereum Sepolia (FREE)
- ✅ Frontend application with blockchain integration
- ✅ Complete end-to-end voting system

## 📋 Prerequisites

### Required Tools
- **Node.js** v16+ and npm
- **MetaMask** browser extension
- **Git** for version control

### Accounts Needed
- **MetaMask wallet** with Sepolia testnet
- **Infura account** (free) for RPC access
- **Etherscan account** (free) for contract verification

## 🔧 Step 1: Environment Setup

### 1.1 Clone Repository
```bash
git clone <your-repo-url>
cd voteguard
npm install
```

### 1.2 Get Free Test ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect MetaMask to Sepolia testnet
3. Request 0.1-0.5 SEP (sufficient for deployment and testing)

### 1.3 Setup Infura
1. Go to [Infura.io](https://infura.io/) and create free account
2. Create new project
3. Copy your Project ID from settings
4. Your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 1.4 Get Etherscan API Key
1. Go to [Etherscan.io](https://etherscan.io/) and create account
2. Navigate to API Keys section
3. Create new API key for contract verification

## 🏗️ Step 2: Smart Contract Deployment

### 2.1 Configure Environment
```bash
cd contracts
cp .env.example .env
```

Edit `.env` file:
```env
ETHEREUM_PRIVATE_KEY=your_metamask_private_key_without_0x
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Note**: Never commit your private key to version control!

### 2.2 Install Dependencies & Compile
```bash
npm install
npm run compile
```

### 2.3 Deploy Contract
```bash
npm run deploy
```

Expected output:
```
Deploying VotingContract to Ethereum Sepolia Testnet...
Deploying contract with account: 0x1234...
Contract deployed to: 0xabcd1234...
Transaction hash: 0x5678efgh...
```

### 2.4 Verify Contract (Optional but Recommended)
```bash
npm run verify
```

## 🌐 Step 3: Frontend Configuration

### 3.1 Update Contract Address
The deployment script automatically updates `public/contract-deployment.json`, but verify it contains:
```json
{
  "network": "sepolia",
  "contractAddress": "0xYOUR_DEPLOYED_CONTRACT_ADDRESS",
  "transactionHash": "0xDEPLOYMENT_TX_HASH",
  "deployedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3.2 Configure Environment Variables
Create `.env` in project root:
```env
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 3.3 Start Application
```bash
npm run dev
```

Your application should now be running at `http://localhost:5173`

## 🧪 Step 4: Testing Your Deployment

### 4.1 Connect MetaMask
1. Open your application
2. Navigate to `/blockchain` page
3. Click "Connect MetaMask"
4. Approve connection and switch to Sepolia

### 4.2 Test Voting Flow
1. Go to `/auth` and complete authentication
2. Navigate to `/voting` page
3. Select a party and cast vote
4. Verify transaction on [Sepolia Etherscan](https://sepolia.etherscan.io/)

### 4.3 Verify Blockchain Integration
- Check wallet connection status
- Verify vote transactions appear in blockchain explorer
- Test real-time updates on blockchain dashboard

## 🔒 Step 5: Admin Setup (Optional)

### 5.1 Grant Admin Role
Use Etherscan or your preferred contract interaction tool:
```solidity
// Function: grantRole
// Role: 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775 (ADMIN_ROLE)
// Account: 0xYOUR_ADMIN_ADDRESS
```

### 5.2 Test Multi-Signature Functions
- Create test election
- Verify multi-signature requirements
- Test emergency pause functionality

## 🚀 Step 6: Production Deployment

### 6.1 Build for Production
```bash
npm run build
```

### 6.2 Deploy Frontend
Deploy the `dist/` folder to your preferred hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Lovable**: Use the built-in deployment feature

## 🔍 Verification Checklist

Before going live, verify:

### Smart Contract
- ✅ Contract deployed successfully
- ✅ Contract verified on Etherscan
- ✅ Admin roles configured correctly
- ✅ Test transactions working

### Frontend Application
- ✅ MetaMask connection working
- ✅ Blockchain page displays correctly
- ✅ Voting flow completes successfully
- ✅ Real-time updates functioning

### Security
- ✅ Private keys secured
- ✅ Environment variables configured
- ✅ No sensitive data in repository
- ✅ Multi-signature requirements tested

## 🐛 Troubleshooting

### Common Issues

#### "Insufficient funds for gas"
**Solution**: Get more test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

#### "Network mismatch"
**Solution**: Switch MetaMask to Sepolia testnet (Chain ID: 11155111)

#### "Contract deployment failed"
**Solution**: 
- Check your private key format (no 0x prefix)
- Verify Infura RPC URL is correct
- Ensure sufficient test ETH balance

#### "MetaMask connection issues"
**Solution**:
- Refresh page and reconnect
- Clear MetaMask cache
- Ensure you're on Sepolia testnet

### Debug Mode
Enable detailed logging by adding:
```env
VITE_DEBUG=true
```

## 📞 Support

Need help? Check:
1. **Console logs** for detailed error messages
2. **Etherscan** for transaction status
3. **MetaMask activity** for connection issues
4. **Network status** on Sepolia explorer

## 🎉 Congratulations!

You've successfully deployed VoteGuard on Ethereum blockchain! Your voting system now features:

- 🔒 **Immutable vote records** on blockchain
- 🔐 **Biometric authentication** for security
- 📊 **Real-time analytics** and monitoring  
- 🌐 **Decentralized** and transparent voting
- 💰 **Free operation** on Sepolia testnet

**Next Steps**: Consider professional security audit before mainnet deployment for production use.

---

*Built with ❤️ for the future of democratic participation*