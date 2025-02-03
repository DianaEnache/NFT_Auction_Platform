pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Auction{
    struct Listing{
        IERC721 nft;
        uint256 nftId;
        uint256 minPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        address owner;
    }
    uint256 nextListingId;
    mapping (uint256 => Listing) listings;
    mapping(address => uint256) balances;

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

    modifier listingExists(uint256 listingId){
        require(listings[listingId].owner != address(0), "Listing does not exist");
        _;
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) public returns (bytes4){
        return IERC721Receiver.onERC721Received.selector;
    }

    function list(address nft, uint256 nftId, uint256 minPrice, uint256 numMinutes) external{
        IERC721 nftContract = IERC721(nft);
        require(nftContract.ownerOf(nftId) == msg.sender, "You don't own this NFT");
        require(nftContract.getApproved(nftId) == address(this), "Contract is not approved to transfer this NFT");
        //require(endTime > block.timestamp, "End time should be in the future");
        //require(minPrice > 0, "Minimum price should be greater than 0");
        nftContract.safeTransferFrom(msg.sender, address(this), nftId);
        //listings[nextListingId] = Listing(nft, nftId, minPrice, 0, address(0), endTime, msg.sender);
        Listing storage listing = listings[nextListingId];
        listing.nft = nftContract;
        listing.nftId = nftId;
        listing.minPrice = minPrice;
        listing.endTime = block.timestamp + (numMinutes * 1 minutes);
        listing.owner = msg.sender;
        listing.highestBidder = msg.sender;
        emit List(msg.sender, nft, nftId, nextListingId, minPrice, listing.endTime, block.timestamp);
        nextListingId++;
    }

    function bid(uint256 listingID) external payable listingExists(listingID){
        Listing storage listing = listings[listingID];
        require(msg.value >= listing.minPrice, "Bid must be higher than the minimum price");
        require(msg.value > listing.highestBid, "Bid must be higher than the current highest bid");
        require(block.timestamp < listing.endTime, "Auction has ended");
        if(listing.highestBid > 0){
            balances[listing.highestBidder] += listing.highestBid;
        }
        //balances[listing.highestBidder] += listing.highestBid;
        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;
        emit Bid(msg.sender, listingID, msg.value, block.timestamp);
    }

    function end(uint256 listingId) external listingExists(listingId){
        Listing storage listing = listings[listingId];
        require(block.timestamp > listing.endTime, "Auction has not ended yet");
        //require(msg.sender == listing.owner, "You are not the owner of this listing");
        //if(listing.highestBid > 0){
            balances[listing.owner] += listing.highestBid;
            listing.nft.safeTransferFrom(address(this), listing.highestBidder, listing.nftId);
            //listing.owner = address(0);
        //}
        delete listings[listingId];
    }

    function withdrawFunds() external {
        uint256 amount = balances[msg.sender];
        //require(amount > 0, "You have no funds to withdraw");
        balances[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
        //payable(msg.sender).transfer(amount);
    }

    function getListing(uint256 listingId) public view listingExists(listingId) returns(address, uint256, uint256, uint256, uint256){
        return (address(listings[listingId].nft),
        listings[listingId].nftId,
        listings[listingId].highestBid,
        listings[listingId].minPrice,
        listings[listingId].endTime);
        
    }
}