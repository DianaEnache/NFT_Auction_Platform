// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Auction {
    address public owner;
    uint public startBlock;
    uint public endBlock;
    string public ipfsHash;

    enum State { Started, Running, Ended, Canceled }
    State public auctionState;

    uint public highestBindingBid;
    address public highestBidder;

    mapping(address => uint) public bids;
    uint bidIncrement;

    constructor(uint _startBlock, uint _endBlock, string memory _ipfsHash) {
        owner = msg.sender;
        auctionState = State.Running;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
        bidIncrement = 1 ether;
    }

    modifier notOwner() {
        require(msg.sender != owner);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier afterStart() {
        require(block.number >= startBlock);
        _;
    }

    modifier beforeEnd() {
        require(block.number <= endBlock);
        _;
    }

    function min(uint a, uint b) pure internal returns (uint) {
        if (a <= b) {
            return a;
        } else {
            return b;
        }
    }

    function placeBid() public payable notOwner afterStart beforeEnd {
        require(auctionState == State.Running);
        require(msg.value >= 1 ether);

        uint currentBid = bids[msg.sender] + msg.value;
        require(currentBid > highestBindingBid);

        bids[msg.sender] = currentBid;

        if (currentBid <= bids[highestBidder]) {
            highestBindingBid = min(currentBid + bidIncrement, bids[highestBidder]);
        } else {
            highestBindingBid = min(currentBid, bids[highestBidder] + bidIncrement);
            highestBidder = msg.sender;
        }
    }

    function cancelAuction() public onlyOwner {
        auctionState = State.Canceled;
    }

    function finalizeAuction() public {
        require(auctionState == State.Canceled || block.number > endBlock);
        require(msg.sender == owner || bids[msg.sender] > 0);

        address recipient;
        uint value;

        if (auctionState == State.Canceled) {
            recipient = msg.sender;
            value = bids[msg.sender];
        } else {
            if (msg.sender == owner) {
                recipient = owner;
                value = highestBindingBid;
            } else {
                if (msg.sender == highestBidder) {
                    recipient = highestBidder;
                    value = bids[highestBidder] - highestBindingBid;
                } else {
                    recipient = msg.sender;
                    value = bids[msg.sender];
                }
            }
        }

        bids[recipient] = 0;
        payable(recipient).transfer(value);
    }
}