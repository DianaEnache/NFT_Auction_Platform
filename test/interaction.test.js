const { expect } = require("chai");

describe("InteractionContract", function () {
  it("Should interact with the auction contract", async function () {
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(0, 100, "ipfsHash");
    await auction.deployed();

    const InteractionContract = await ethers.getContractFactory("InteractionContract");
    const interactionContract = await InteractionContract.deploy(auction.address);
    await interactionContract.deployed();

    const [owner, highestBid, auctionState] = await interactionContract.getAuctionDetails();
    expect(owner).to.equal(await auction.owner());
    expect(highestBid).to.equal(await auction.highestBindingBid());
    expect(auctionState).to.equal(await auction.auctionState());
  });
});