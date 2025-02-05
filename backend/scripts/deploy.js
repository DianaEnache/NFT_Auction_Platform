const fs = require('fs/promises');
const hre = require('hardhat');

const CONTRACT_NAME = 'Minty';

async function deployContract() {
    const network = hre.network.name;

    console.log(`Deploying contracts on network: ${network}`);

    // Deploy Minty contract
    const Minty = await hre.ethers.getContractFactory(CONTRACT_NAME);
    const minty = await Minty.deploy("MintyNFT", "MNTY"); // Add token name and symbol
    await minty.waitForDeployment();
    console.log(`Minty contract deployed to: ${minty.target} (network: ${network})`);

    // Deploy Auction contract
    const Auction = await hre.ethers.getContractFactory('Auction');
    const auction = await Auction.deploy();
    await auction.waitForDeployment();
    console.log(`Auction contract deployed to: ${auction.target} (network: ${network})`);

    // Save deployment info
    await writeDeploymentInfo(minty, "minty.json");
    await writeDeploymentInfo(auction, "auction.json");

    console.log("Deployment completed successfully.");
}

async function writeDeploymentInfo(contract, filename) {
    const data = {
        contract: {
            address: contract.target, 
            signerAddress: contract.runner.address, 
            abi: contract.interface.format()
        }
    };

    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(`deployments/${filename}`, content, { encoding: 'utf-8' });
    console.log(`Saved deployment info to deployments/${filename}`);
}

// Execute deployment
deployContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
