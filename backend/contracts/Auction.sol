// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";

contract Auction {
    struct Listing {
        IERC721 nft;
        uint256 nftId;
        uint256 minPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        address owner;
        bool ended;
    }

    uint256 private nextListingId;
    mapping(uint256 => Listing) private listings;
    mapping(address => uint256) private balances;

    event List(
        address indexed lister,
        address indexed nft,
        uint256 indexed nftId,
        uint256 listingId,
        uint256 minPrice,
        uint256 endTime,
        uint256 timestamp
    );

    event Bid(
        address indexed bidder,
        uint256 indexed listingId,
        uint256 amount,
        uint256 timestamp
    );

    event AuctionEnded(
        uint256 indexed listingId,
        address winner,
        uint256 winningBid,
        uint256 timestamp
    );

    event FundsWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    modifier listingExists(uint256 listingId) {
        require(listings[listingId].owner != address(0), "Listing does not exist");
        _;
    }

    function onERC721Received(address, address, uint256, bytes calldata) public pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function list(address nft, uint256 nftId, uint256 minPrice, uint256 numHours) external {
    console.log("Before listing: nextListingId =", nextListingId);

    IERC721 nftContract = IERC721(nft);
    require(nftContract.ownerOf(nftId) == msg.sender, "You don't own this NFT");
    require(nftContract.getApproved(nftId) == address(this), "Contract is NOT approved to transfer this NFT");

    nftContract.safeTransferFrom(msg.sender, address(this), nftId);

    listings[nextListingId] = Listing({
        nft: nftContract,
        nftId: nftId,
        minPrice: minPrice,
        highestBid: 0,
        highestBidder: address(0),
        endTime: block.timestamp + (numHours * 1 minutes),
        owner: msg.sender,
        ended: false
    });

    console.log("After listing: nextListingId =", nextListingId);
    
    emit List(msg.sender, nft, nftId, nextListingId, minPrice, block.timestamp + (numHours * 1 minutes), block.timestamp);

    nextListingId++; 
}


    function bid(uint256 listingID) external payable listingExists(listingID) {
        Listing storage listing = listings[listingID];
        require(msg.sender != listing.owner, "Owner cannot bid on their own auction");
        require(msg.value >= listing.minPrice, "Bid must be higher than the minimum price");
        require(msg.value > listing.highestBid, "Bid must be higher than the current highest bid");
        require(block.timestamp < listing.endTime, "Auction has ended");

        // Refund the previous highest bidder
        if (listing.highestBid > 0) {
            balances[listing.highestBidder] += listing.highestBid;
        }

        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;

        emit Bid(msg.sender, listingID, msg.value, block.timestamp);
    }

    function end(uint256 listingId) external listingExists(listingId) {
        Listing storage listing = listings[listingId];
        require(block.timestamp > listing.endTime, "Auction has not ended yet");
        require(!listing.ended, "Auction already ended");
        require(msg.sender == listing.owner, "You are not the owner of this listing");

        listing.ended = true;

        if (listing.highestBid > 0) {
            // Transfer funds to seller
            balances[listing.owner] += listing.highestBid;

            // Transfer NFT to the highest bidder
            listing.nft.safeTransferFrom(address(this), listing.highestBidder, listing.nftId);
        } else {
            // If no bids, return NFT to the seller
            listing.nft.safeTransferFrom(address(this), listing.owner, listing.nftId);
        }

        emit AuctionEnded(listingId, listing.highestBidder, listing.highestBid, block.timestamp);
        delete listings[listingId];
    }

    function withdrawFunds() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds available for withdrawal");

        balances[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit FundsWithdrawn(msg.sender, amount, block.timestamp);
    }

    function getListing(uint256 listingId) public view listingExists(listingId) returns (
        address nft,
        uint256 nftId,
        uint256 highestBid,
        uint256 minPrice,
        uint256 endTime,
        address highestBidder,
        address owner
    ) {
        Listing memory listing = listings[listingId];
        return (
            address(listing.nft),
            listing.nftId,
            listing.highestBid,
            listing.minPrice,
            listing.endTime,
            listing.highestBidder,
            listing.owner
        );
    }
}