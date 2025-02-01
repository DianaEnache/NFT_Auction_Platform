const { expect } = require("chai");

describe("Auction", function () {
  it("Should deploy the auction contract", async function () {
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(0, 100, "ipfsHash");
    await auction.deployed();
    expect(auction.address).to.properAddress;
  });
});