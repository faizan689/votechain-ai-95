require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.ETHEREUM_PRIVATE_KEY ? [process.env.ETHEREUM_PRIVATE_KEY] : [],
      gas: 5000000, // Increased gas limit
      gasPrice: 20000000000, // 20 gwei
      timeout: 60000, // 60 seconds timeout
      confirmations: 2 // Wait for 2 confirmations
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test", 
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 300000 // 5 minutes for tests
  }
};