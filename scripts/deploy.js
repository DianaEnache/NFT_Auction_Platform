async function main() {
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(0, 100, "ipfsHash");
  
    await auction.deployed();
  
    console.log("Auction deployed to:", auction.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });