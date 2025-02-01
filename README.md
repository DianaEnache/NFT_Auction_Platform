# NFT_Auction_Platform

Cerințe și Implementare
1. Utilizarea tipurilor de date specifice Solidity (mappings, address):
- Mappings: mapping(address => uint) public bids; în Auction.sol.
- Address: address public owner; în Auction.sol.

2. Înregistrarea de events:
- Events: event BidPlaced(address bidder, uint amount); și event AuctionFinalized(address winner, uint amount); în Auction.sol.

3. Utilizarea de modifiers:
- Modifiers: notOwner, onlyOwner, afterStart, beforeEnd în Auction.sol.

4. Exemple pentru toate tipurile de funcții (external, pure, view etc.):
- External: function placeBid() external payable notOwner afterStart beforeEnd; în Auction.sol.
- Pure: function min(uint a, uint b) pure internal returns (uint); în Auction.sol.
- View: function getHighestBid() external view returns (uint); în Auction.sol.

5. Exemple de transfer de ETH:
- Transfer de ETH: payable(recipient).transfer(value); în Auction.sol în funcția finalizeAuction.
Ilustrarea interacțiunii dintre smart contracte:

6. Interacțiunea dintre smart contracte: 
- InteractionContract interacționează cu Auction prin auction.getOwner(), auction.getHighestBid(), auction.getAuctionState() în InteractionContract.sol.

7. Deploy pe o rețea locală sau pe o rețea de test Ethereum:
- Deploy pe rețea locală: Am folosit Hardhat pentru a compila și a deploy contractele pe o rețea locală (Hardhat Network).