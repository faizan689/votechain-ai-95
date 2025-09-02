# VoteGuard - Blockchain Voting System 🗳️⚡

A secure, transparent, and decentralized voting platform built with React, Ethereum blockchain, and biometric authentication.

## 🚀 Features

### 🔗 Blockchain Integration
- **Smart Contracts**: Deployed on Ethereum Sepolia Testnet
- **MetaMask Integration**: Seamless wallet connection
- **Immutable Vote Records**: Permanent blockchain storage
- **Multi-Signature Admin**: Enhanced security for admin actions
- **Real-time Monitoring**: Live transaction tracking
- **Free Operation**: Runs completely free on testnet

### 🔐 Security Features
- **Biometric Authentication**: Facial recognition verification
- **One Person, One Vote**: Blockchain-enforced voting limits
- **End-to-End Encryption**: Secure data transmission
- **Multi-Factor Authentication**: OTP + Facial verification
- **Tamper-Proof Records**: Cryptographically secured votes

### 💻 User Experience
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live vote counting
- **Admin Dashboard**: Comprehensive election management
- **Blockchain Dashboard**: Complete Web3 interface
- **Intuitive UI**: User-friendly voting experience

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Blockchain**: Solidity, Hardhat, Ethers.js, MetaMask SDK
- **Authentication**: Supabase Auth, Twilio OTP, Face-API.js
- **Database**: Supabase PostgreSQL with RLS
- **Deployment**: Ethereum Sepolia Testnet (FREE)

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd voteguard
npm install
```

### 2. Deploy Smart Contract (FREE)
```bash
# Navigate to contracts directory
cd contracts
npm install

# Copy environment file
cp .env.example .env

# Add your details to .env:
# ETHEREUM_PRIVATE_KEY=your_metamask_private_key
# ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# ETHERSCAN_API_KEY=your_etherscan_api_key

# Deploy to Sepolia testnet
npm run deploy
```

### 3. Get Free Test ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your MetaMask wallet
3. Request 0.1 SEP (enough for all testing)

### 4. Start Application
```bash
npm run dev
```

### 5. Connect & Vote
1. Install MetaMask extension
2. Switch to Sepolia testnet
3. Visit `/blockchain` page and connect wallet
4. Cast your first blockchain vote!

## 📱 Application Pages

| Page | Description |
|------|-------------|
| **/** | Homepage with blockchain features showcase |
| **/auth** | User authentication with biometric enrollment |
| **/voting** | Cast votes with blockchain integration |
| **/blockchain** | Complete Web3 dashboard and wallet management |
| **/confirmation** | Vote confirmation with transaction details |
| **/admin** | Admin panel with real-time analytics |

## 🔐 Smart Contract Features

✅ **Implemented & Tested:**
- Biometric voter registration with face hash storage
- Secure vote casting with biometric verification
- Multi-signature admin functions (requires 2+ signatures)
- Emergency pause/unpause functionality
- Real-time vote counting and verification
- Immutable audit trail on blockchain
- Role-based access control (Admin, Voter, Verifier)

## 🌐 Network Configuration

### Ethereum Sepolia Testnet (FREE)
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Block Explorer**: https://sepolia.etherscan.io/
- **Test ETH Faucet**: https://sepoliafaucet.com/
- **Cost**: FREE (uses test ETH)

## 📚 Documentation

- [`contracts/README.md`](contracts/README.md) - Smart contract documentation
- [`public/deployment-guide.md`](public/deployment-guide.md) - Step-by-step deployment
- [`research-paper.md`](research-paper.md) - Technical research paper

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Deploy smart contract
cd contracts && npm run deploy

# Verify contract on Etherscan
cd contracts && npm run verify

# Run tests
npm test
```

## 🎯 Key Benefits

✅ **Completely Free** - Runs on Sepolia testnet  
✅ **Secure** - Blockchain + biometric authentication  
✅ **Transparent** - All votes publicly verifiable  
✅ **Scalable** - Built for production use  
✅ **User-Friendly** - Intuitive Web3 interface  
✅ **Immutable** - Permanent vote records  
✅ **Anonymous** - Privacy-preserving voting  

## 🚀 Production Deployment

For production use:
1. **Audit smart contracts** with professional security firm
2. **Deploy to Ethereum Mainnet** (requires real ETH)
3. **Setup monitoring** and backup systems
4. **Configure production database** with proper scaling
5. **Implement additional security** measures

## 📄 Environment Variables

Create `.env` file in project root:
```env
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 🆘 Support & Troubleshooting

### Common Issues:
- **MetaMask Connection**: Ensure you're on Sepolia testnet
- **Deployment Fails**: Check you have sufficient test ETH
- **Vote Fails**: Verify wallet is connected and approved
- **Build Errors**: Run `npm install` and check Node.js version

### Get Help:
- Check console logs for detailed error messages
- Verify all environment variables are configured
- Test with smaller transactions first
- Ensure MetaMask is unlocked and connected

---

**🎉 Ready to revolutionize voting with blockchain technology!**

Built with ❤️ for secure democratic participation