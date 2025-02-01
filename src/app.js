// filepath: /d:/fmi/an3/blockchain/NFT_Auction_Platform/src/app.js
import { ethers } from 'ethers';

let provider;
let signer;
let auctionContract;
let interactionContract;

const auctionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed Auction contract address
const interactionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your deployed InteractionContract address

const auctionAbi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_startBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_endBlock",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_ipfsHash",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "auctionState",
        "outputs": [
            {
                "internalType": "enum Auction.State",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cancelAuction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "finalizeAuction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAuctionState",
        "outputs": [
            {
                "internalType": "enum Auction.State",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getHighestBid",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "highestBindingBid",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "highestBidder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "placeBid",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];

const interactionAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_auctionAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "auction",
        "outputs": [
            {
                "internalType": "contract Auction",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAuctionDetails",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "enum Auction.State",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

document.getElementById("connectButton").onclick = async () => {
    await connectWallet();
    await getAccountInfo();
    await getAuctionDetails();
};

async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        auctionContract = new ethers.Contract(auctionAddress, auctionAbi, signer);
        interactionContract = new ethers.Contract(interactionAddress, interactionAbi, signer);
    } else {
        alert("Please install MetaMask!");
    }
}

async function getAccountInfo() {
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    document.getElementById("accountInfo").innerHTML = `
        <p>Address: ${address}</p>
        <p>Balance: ${ethers.utils.formatEther(balance)} ETH</p>
    `;
}

async function getAuctionDetails() {
    const [owner, highestBid, auctionState] = await interactionContract.getAuctionDetails();
    document.getElementById("auctionInfo").innerHTML = `
        <p>Owner: ${owner}</p>
        <p>Highest Bid: ${ethers.utils.formatEther(highestBid)} ETH</p>
        <p>Auction State: ${auctionState}</p>
    `;
}