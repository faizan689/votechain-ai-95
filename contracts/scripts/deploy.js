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
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: votingContract.address,
    transactionHash: votingContract.deployTransaction.hash,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };
  
  fs.writeFileSync(
    "../public/contract-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to public/contract-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });