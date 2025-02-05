// filepath: /d:/fmi/an3/blockchain/NFT_Auction_Platform/backend/contracts/Minty.sol
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Minty is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory tokenName, string memory symbol) ERC721(tokenName, symbol)
    {
       // _setBaseURI("ipfs://"); // This is the base URI for the token metadata
    }

    function mintToken(address owner, string memory metadataURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        return newTokenId;
    }

function getTotalMintedTokens() public view returns (uint256) {
    return _tokenIds.current();
}

 
}