async function main() {
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(0, 100, "ipfsHash");
  
    await auction.deployed();
  
    console.log("Auction deployed to:", auction.address);
  
    const InteractionContract = await ethers.getContractFactory("InteractionContract");
    const interactionContract = await InteractionContract.deploy(auction.address);
  
    await interactionContract.deployed();
  
    console.log("InteractionContract deployed to:", interactionContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });