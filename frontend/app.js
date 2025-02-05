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


async function list() {
    await getAccess();
    const id = document.getElementById("tokenId").value;
    const minPrice = document.getElementById("min-price-list").value;
    const duration = document.getElementById("list-duration").value;

    console.log("📢 Listing NFT:", id, "Min Price:", minPrice, "Duration:", duration, "minutes");

    try {
        let tx = await auctionContract.list(nftAddress, id, minPrice, duration);
        await tx.wait();
        alert("✅ Success! NFT Listed.");

    } catch (error) {
        console.error("❌ List Error:", error);
        if (error.data) alert(error.data.message);
        else alert(error);
    }
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
    const id = document.getElementById("token-id-approve").value;
    console.log("Approving NFT ID:", id, " for auction contract:", auctionAddress);

    try {
        let tx = await nftContract.approve(auctionAddress, id);
        console.log("⏳ Waiting for transaction confirmation...");
        await tx.wait(); // Așteaptă ca tranzacția să fie validată pe blockchain

        console.log("✅ Success! NFT Approved.");

        // Acum verifică aprobarea
        const approvedAddress = await nftContract.getApproved(id);
        console.log(`🔍 Approval check: NFT ID ${id} approved for ${approvedAddress}`);

        if (approvedAddress.toLowerCase() === auctionAddress.toLowerCase()) {
            alert("✅ NFT Approved successfully!");
        } else {
            alert("⚠️ Approval did not go through.");
        }

    } catch (error) {
        console.error("❌ Approve Error:", error);
        if (error.data) alert(error.data.message);
        else alert(error);
    }
}




async function withdrawFunds(){
    await getAccess();
    await auctionContract.withdrawFunds().then(() => alert("succes"))
        .catch((error) =>{
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}

async function view(listingId = null) {
    await getAccess();

    // Dacă `listingId` nu e dat ca parametru, îl ia din input
    if (listingId === null) {
        listingId = document.getElementById("listing-id-view").value;
    }

    if (!listingId || isNaN(listingId) || listingId < 0) {
        console.error("⚠️ Invalid Listing ID:", listingId);
        alert("Please enter a valid Listing ID!");
        return;
    }

    console.log("Fetching NFT data for Listing ID:", listingId);

    try {
        // Fetch auction listing details
        const listing = await auctionContract.getListing(listingId);
        if (!listing) {
            console.error("No listing found for this ID!");
            return;
        }

        const nftContractAddress = listing[0];
        const nftId = listing[1].toNumber();
        const highestBid = listing[2];
        const minPrice = listing[3];
        const endTime = new Date(listing[4].toNumber() * 1000).toLocaleString();

        console.log("✅ Listing details:", {
            "NFT Contract": nftContractAddress,
            "NFT ID": nftId,
            "Highest Bid": highestBid,
            "Min Price": minPrice,
            "End Time": endTime
        });

        // Update HTML elements with listing details
        document.getElementById("contract-address").innerText = nftContractAddress;
        document.getElementById("nft-id").innerText = nftId;
        document.getElementById("current-bid").innerText = highestBid;
        document.getElementById("min-price-view").innerText = minPrice;
        document.getElementById("end-time-view").innerText = endTime;

        // Obține metadata NFT
        const metadataURI = await nftContract.tokenURI(nftId);
        console.log("Metadata URI from contract:", metadataURI);

        if (!metadataURI) {
            console.error("No metadata found for this NFT!");
            return;
        }

        const metadataURL = metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log("Fetching metadata from:", metadataURL);

        const response = await fetch(metadataURL);
        if (!response.ok) {
            console.error("❌ Failed to fetch metadata:", response.statusText);
            return;
        }

        const metadata = await response.json();
        console.log("✅ Fetched metadata:", metadata);

        if (!metadata.image) {
            console.error("❌ No image found in metadata!");
            return;
        }

        const imageURL = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log("Displaying image from:", imageURL);

        document.getElementById("nft-image").src = imageURL;
        document.getElementById("nft-name").innerText = metadata.name || "No Name Available";
        document.getElementById("nft-desc").innerText = metadata.description || "No Description Available";

    } catch (error) {
        console.error("❌ Error fetching NFT data:", error);
    }
}



async function setupEventListeners() {
    await getAccess();

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
