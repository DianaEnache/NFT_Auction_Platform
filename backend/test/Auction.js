const {expect} = require('chai');

const getTime = async () => {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    return blockBefore.timestamp;
}

describe('Auction', function () {
    let auction;
    let minty;
    let owner;
    let addr1;
    let addr2;

    before(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Minty = await ethers.getContractFactory('Minty');
        minty = await Minty.deploy("Name", "NAME");
        await minty.waitForDeployment();
        
        const Auction = await ethers.getContractFactory('Auction');
        auction = await Auction.deploy();
        await auction.waitForDeployment();

        console.log("Minty contract deployed at:", minty.target);
        console.log("Auction contract deployed at:", auction.target);

        await minty.mintToken(owner.address, "url");
    })

    describe("Listing", ()=> {
        it("Should revert if not approved to list", async () => {
            console.log("Minty Address:", minty.target);
            console.log("Auction Address:", auction.target);

            await expect(auction.list(minty.target, 1, 10, 1)).to.be.reverted;
        });

        it("Should revert if not owner of nft", async () => {
            console.log("Minty Address:", minty.target);
            console.log("Auction Address:", auction.target);

            await expect(auction.connect(addr1).list(minty.target, 1, 10, 1)).to.be.reverted;
        });

        it("Should allow listing nft", async () => {
            console.log("Minty Address:", minty.target);
            console.log("Auction Address:", auction.target);

            await minty.approve(auction.target, 1);
            await expect(auction.list(minty.target, 1, 10, 1)).to.emit(auction, 'List');
            //expect(await auction.getAuction(1)).to.be.equal([minty.address, 1, 10, 1]);
        });

        it("Should allow listing second nft", async () => {
            console.log("Minty Address:", minty.target);
            console.log("Auction Address:", auction.target);

            await minty.mintToken(owner.address, "url2");
            await minty.approve(auction.target, 2);
            await expect(auction.list(minty.target, 2, 100, 2)).to.emit(auction, 'List');
            //expect(await auction.getAuction(1)).to.be.equal([minty.address, 1, 10, 1]);
        });

    });
    describe("Bid", ()=> {
        it("Should not allow if bid below minimum price", async () => {
            await expect(auction.connect(addr1).bid(0, {value: 9})).to.be.reverted;
        });

        it("Should not allow bid on auction that doesnt exist", async () => {
            await expect(auction.connect(addr1).bid(9, {value: 1000})).to.be.reverted;
        });

        it("Should allow valid bid", async () => {
            await expect(auction.connect(addr1).bid(0, {value: 15})).to.emit(auction, 'Bid');
            const [nftContract, nftId, highestBid, minPrice] = await auction.getListing(0);
            expect(nftContract).to.be.equal(minty.target);
            expect(nftId).to.be.equal(1);
            expect(highestBid).to.be.equal(15);
            expect(minPrice).to.be.equal(10);
        });


        it("Should not allow bid that is less than highest bid", async () => {
            await expect(auction.connect(addr2).bid(0, {value: 11})).to.be.reverted;
        });

        it("Should allow valid bid that is higher than highest bid", async () => {
            await expect(auction.connect(addr2).bid(0, {value: 50})).to.emit(auction, 'Bid');
            const [nftContract, nftId, highestBid, minPrice] = await auction.getListing(0);
            expect(nftContract).to.be.equal(minty.target);
            expect(nftId).to.be.equal(1);
            //posibil 2
            expect(highestBid).to.be.equal(50);
            expect(minPrice).to.be.equal(10);
        });

        it("Should not allow bid on auction that has ended", async () => {
            await ethers.provider.send("evm_mine", [(await ethers.provider.getBlock('latest')).timestamp + 60]);
            await expect(auction.connect(addr1).bid(0, {value: 10000000})).to.be.reverted;
        });
    });

    describe("Withdraw Funds", ()=> {
        it("Previous bidders can withdraw funds", async () => {
            await expect( await auction.connect(addr1).withdrawFunds()).to.changeEtherBalances([addr1, auction], [15, -15]);
        });

        it("current highest bidder can not withdraw funds", async () => {
            await expect(await auction.connect(addr2).withdrawFunds()).to.changeEtherBalances([addr2, auction], [0, 0]);
        });

        it("Owner can not withdraw funds", async () => {
            await expect(await auction.connect(owner).withdrawFunds()).to.changeEtherBalances([owner, auction], [0, 0]);
        });
    });
    describe("End", ()=> {
        it("Can not call end if auction has not ended", async () => {
            await expect(auction.end(1)).to.be.reverted;
        });

        it("Can call end on finished listing, should transfer the nft", async () => {
            await auction.end(0);
            expect(await minty.ownerOf(1)).to.be.equal(addr2.address);
        });

        it("Can not call end twice", async () => {
            await expect(auction.end(0)).to.be.reverted;
        });

        it("Auction winner can not withdraw funds when the auction is done", async () => {
            await expect(await auction.connect(addr2).withdrawFunds()).to.changeEtherBalances([addr2, auction], [0, 0]);
        });

        it("Listing owner can withdraw funds when the auction is done", async () => {
            await expect(await auction.connect(owner).withdrawFunds()).to.changeEtherBalances([owner, auction], [50, -50]);
        });

    });

});