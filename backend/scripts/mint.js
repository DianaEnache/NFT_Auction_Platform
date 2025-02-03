const hre = require("hardhat");
const fs = require("fs");

async function main() {
    // Load contract addresses from auction.json
    const deploymentData = JSON.parse(fs.readFileSync("deployments/minty.json", "utf8"));
    const auctionAddress = deploymentData.contract.address;

    // Get signers
    const [owner] = await hre.ethers.getSigners();

    // Attach to deployed Minty contract
    const Minty = await hre.ethers.getContractFactory("Minty");
    const minty = await Minty.attach(auctionAddress);

    console.log(`Minting NFT on contract: ${minty.target}`);

    // Mint an NFT
    const tx = await minty.mintToken(owner.address, "ipfs://metadata_url");
    await tx.wait();
    console.log(`✅ NFT minted successfully for ${owner.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Minting failed:", error);
        process.exit(1);
    });
