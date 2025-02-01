// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Auction.sol";

contract InteractionContract {
    Auction public auction;

    constructor(address _auctionAddress) {
        auction = Auction(_auctionAddress);
    }

    function getAuctionDetails() external view returns (address, uint, Auction.State) {
        return (auction.owner(), auction.highestBindingBid(), auction.auctionState());
    }
}