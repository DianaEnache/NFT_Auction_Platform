const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const nftAbi=[
    "constructor(string tokenName, string symbol)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
    "event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId)",
    "event MetadataUpdate(uint256 _tokenId)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function mintToken(address owner, string metadataURI) returns (uint256)",
    "function name() view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
    "function setApprovalForAll(address operator, bool approved)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function symbol() view returns (string)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function transferFrom(address from, address to, uint256 tokenId)"
  
];
const nftAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3";
let nftContract = null;

let auctionAbi=[
    "event Bid(address indexed bidder, uint256 indexed listingId, uint256 amount, uint256 timestamp)",
      "event List(address indexed lister, address indexed nft, uint256 indexed nftId, uint256 listingId, uint256 minPrice, uint256 endTime, uint256 timestamp)",
      "function bid(uint256 listingID) payable",
      "function end(uint256 listingId)",
      "function getListing(uint256 listingId) view returns (address, uint256, uint256, uint256, uint256)",
      "function list(address nft, uint256 nftId, uint256 minPrice, uint256 numHours)",
      "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) returns (bytes4)",
      "function withdrawFunds()"
];
const auctionAddress="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let auctionContract = null;

async function getAccess(){
    if (nftContract) return;
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    nftContract = new ethers.Contract(nftAddress, nftAbi, signer);
    auctionContract = new ethers.Contract(auctionAddress, auctionAbi, signer);
}

async function list(){
    await getAccess();
    const id = document.getElementById("tokenId").value;
    const minPrice = document.getElementById("min-price-list").value;
    const duration = document.getElementById("list-duration").value;
    
    console.log("Listing NFT:", id, "Min Price:", minPrice, "Duration:", duration, "minutes");

    await auctionContract.list(nftAddress, id, minPrice, duration)
        .then(() => alert("Succes! NFT Listed."))
        .catch((error) =>{
            console.error("List Error:", error);
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}



async function end(){
    await getAccess();
    const id = document.getElementById("listing-id-end").value;
    await auctionContract.end(id).then(() => alert("succes"))
        .catch((error) =>{
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}

async function bid(){
    await getAccess();
    const id = document.getElementById("listing-id-bid").value;
    const amount = document.getElementById("bid-amount").value;
    await auctionContract.bid(id, {value: amount}).then(() => alert("succes"))
        .catch((error) =>{
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}


async function approve(){
    await getAccess();
    const blockNumber = await provider.getBlockNumber();
    const id = document.getElementById("token-id-approve").value;
    console.log("Approving NFT ID:", id, " for auction contract:", auctionAddress);

    await nftContract.approve(auctionAddress, id)
        .then(async () => {
            console.log("Succes! NFT Approved.");
            // Verificare dacă NFT-ul a fost aprobat
            const approvedAddress = await nftContract.getApproved(id);
            console.log(`Approval check: NFT ID ${id} approved for ${approvedAddress}`);
            alert("Succes! NFT Approved.");
        })
        .catch((error) =>{
            console.error("Approve Error:", error);
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}



async function withdrawFunds(){
    await getAccess();
    await auctionContract.withdrawFunds().then(() => alert("succes"))
        .catch((error) =>{
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}

async function view(){
    await getAccess();
    const blockNumber = await provider.getBlockNumber();
    const id = document.getElementById("listing-id-view").value;
    const result = await auctionContract.getListing(id)
       .catch((error) =>{
        if (error.data) alert(error.data.message);
        else alert(error);
    });

    if (!result) return;
    document.getElementById("contract-address").innerHTML = result[0];
    document.getElementById("nft-id").innerHTML = result[1];
    document.getElementById("current-bid").innerHTML = result[2];
    document.getElementById("min-price-view").innerHTML = result[3];
    document.getElementById("end-time-view").innerHTML = new Date(result[4].toNumber() * 1000);

}

async function setupEventListeners() {
    await getAccess();
    const blockNumber = await provider.getBlockNumber();
    auctionContract.on("List", (lister, nft, nftId, listingId, minPrice, endTime, timestamp) => {
        console.log(`📢 NFT ${nftId} listed at ${minPrice} ETH by ${lister}`);
        alert(`📢 New listing: NFT ${nftId} at ${minPrice} ETH`);
    });

    auctionContract.on("Bid", (bidder, listingId, amount, timestamp) => {
        console.log(`💰 New bid of ${ethers.utils.formatEther(amount)} ETH from ${bidder} on listing ${listingId}`);
        alert(`💰 New bid: ${ethers.utils.formatEther(amount)} ETH from ${bidder}`);
    });
}

setupEventListeners();
