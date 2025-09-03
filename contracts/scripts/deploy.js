const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying VotingContract to Ethereum Sepolia Testnet...");
  
  // Get the ContractFactory and Signers
  const VotingContract = await ethers.getContractFactory("VotingContract");
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contract with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy the contract
  const votingContract = await VotingContract.deploy();
  await votingContract.deployed();
  
  console.log("VotingContract deployed to:", votingContract.address);
  console.log("Transaction hash:", votingContract.deployTransaction.hash);
  
  // Wait for a few confirmations
  console.log("Waiting for confirmations...");
  await votingContract.deployTransaction.wait(6);
  
  console.log("Contract verified and confirmed!");
  
  // Save deployment info to both locations
  const fs = require("fs");
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: votingContract.address,
    transactionHash: votingContract.deployTransaction.hash,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    blockNumber: votingContract.deployTransaction.blockNumber
  };
  
  // Save to project root (for frontend)
  fs.writeFileSync(
    "../public/contract-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Save to contracts folder (for reference)
  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to:");
  console.log("- public/contract-deployment.json");
  console.log("- contracts/deployment-info.json");
  
  // Update environment variables for frontend
  const envContent = `VITE_CONTRACT_ADDRESS=${votingContract.address}\nVITE_DEPLOYMENT_NETWORK=sepolia\nVITE_DEPLOYMENT_BLOCK=${votingContract.deployTransaction.blockNumber}`;
  
  try {
    fs.writeFileSync("../.env.local", envContent);
    console.log("Environment variables updated in .env.local");
  } catch (error) {
    console.log("Note: Add this to your .env.local file:");
    console.log(envContent);
  }
  
  console.log("\n🎉 Deployment Complete!");
  console.log("📋 Next Steps:");
  console.log("1. Verify contract: npm run verify");
  console.log("2. View on Etherscan: https://sepolia.etherscan.io/address/" + votingContract.address);
  console.log("3. Connect MetaMask to Sepolia testnet");
  console.log("4. Start your frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });