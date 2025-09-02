const { ethers } = require("hardhat");

async function main() {
  // Read deployment info
  const fs = require("fs");
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("../public/contract-deployment.json", "utf8"));
  } catch (error) {
    console.error("Could not read deployment info. Please deploy first.");
    process.exit(1);
  }
  
  console.log("Verifying contract at:", deploymentInfo.contractAddress);
  
  // Verify the contract on Etherscan
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: [],
    });
    
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });