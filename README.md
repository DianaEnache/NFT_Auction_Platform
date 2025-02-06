# 🎯 NFT Auction Platform
---
## 🚀 Instalare și Rulare

### 1️⃣ **Clonarea Proiectului**
```bash
git clone https://github.com/DianaEnache/NFT_Auction_Platform
cd repository
```

### 2️⃣ **Instalarea Dependențelor**
```bash
npm install
npm init -y
npm install hardhat
npm install -g http-server
```

### 3️⃣ **Compilarea și Deploy-ul Contractelor**
```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/mint.js --network localhost
```

### 4️⃣ **Rularea Testelor**
```bash
npx hardhat test
```

### 5️⃣ **Rulare Frontend**
```bash
http-server
```
---
## ✅ Cerințe Îndeplinite Backend

### 🟢 **Cerințe Obligatorii**

1. **Utilizarea tipurilor de date specifice Solidity (`mappings`, `address`)**  
   ```solidity
   mapping(uint256 => AuctionItem) public auctions;
   address payable public highestBidder;
   ```

2. **Înregistrarea de events**  
   ```solidity
   event List(address indexed nftContract, uint256 indexed nftId, uint256 minPrice, uint256 duration);
   event Bid(address indexed bidder, uint256 amount);
   event End(address winner, uint256 amount);
   ```

3. **Utilizarea de modifiers**  
   ```solidity
   modifier onlyOwner() {
       require(msg.sender == owner, "Not the contract owner");
       _;
   }
   ```

4. **Exemple pentru toate tipurile de funcții (`external`, `pure`, `view`)**  
   ```solidity
   function getTokenURI(uint256 tokenId) public view returns (string memory) {
       return _tokenURIs[tokenId];
   }

   function calculateFee(uint256 amount) public pure returns (uint256) {
       return amount / 10; 
   }

   function transferOwnership(address newOwner) external {
       require(msg.sender == owner, "Not the contract owner");
       owner = newOwner;
   }
   ```

5. **Exemple de transfer de ETH**  
   ```solidity
   payable(owner).transfer(highestBid);
   ```

6. **Ilustrarea interacțiunii dintre smart contracte**  
   ```javascript
   await minty.mintToken(owner.address, "url");
   await minty.approve(auction.target, 1);
   await auction.list(minty.target, 1, 10, 1);
   ```

7. **Deploy pe o rețea locală sau test Ethereum**  
   ```javascript
   const Minty = await hre.ethers.getContractFactory(CONTRACT_NAME);
   const minty = await Minty.deploy("MintyNFT", "MNTY"); 
   await minty.waitForDeployment();
   ```

---

### 🔵 **Cerințe Opționale**

1. **Utilizare librării externe (`OpenZeppelin`)**  
   ```solidity
   import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";

   contract Minty is ERC721, Ownable {
   ```

2. **Implementarea de teste**  
   ```javascript
   describe("Bid", () => {
       it("Should allow valid bid", async () => {
           await expect(auction.connect(addr1).bid(0, { value: 15 }))
               .to.emit(auction, 'Bid');
       });
   });
   ```

3. **Implementarea unui standard ERC (`ERC721`)**  
   ```solidity
   contract Minty is ERC721, Ownable {
   ```

4. **Utilizarea de IPFS pentru stocarea NFT-urilor**  
   ```javascript
   const tx = await minty.mintToken(owner.address, "ipfs://bafkreidh2l3vzvpp5x3bgvgy4sdq7xt44b33rqacnnvgrxldbgvii4abgm");
   ```
---
## ✅ Cerințe Îndeplinite Frontend

### 🟢 **Cerințe Obligatorii**

1. **Utilizarea unei librării Web3 (`ethers.js`) și conectarea cu un Web3 Provider**  
   - Se folosește `ethers.js` pentru conectarea la blockchain și obținerea informațiilor despre conturi.
   ```javascript
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   let signer;

   async function connectWallet() {
       if (!window.ethereum) {
           alert("Please install MetaMask!");
           return;
       }

       try {
           await provider.send("eth_requestAccounts", []);
           signer = provider.getSigner();
           const address = await signer.getAddress();
           const balance = await provider.getBalance(address);
           const balanceInEth = ethers.utils.formatEther(balance);

           document.getElementById("wallet-address").innerText = `Address: ${address}`;
           document.getElementById("wallet-balance").innerText = `Balance: ${balanceInEth} ETH`;

       } catch (error) {
           console.error("Error connecting wallet:", error);
           alert("Failed to connect wallet.");
       }
   }
   ```

2. **Inițierea tranzacțiilor de transfer sau apel de funcții folosind Web3**  
   - Apelurile contractului sunt realizate folosind `ethers.js`:
   ```javascript
   async function bid(){
       await getAccess();
       const id = document.getElementById("listing-id-bid").value;
       const amount = document.getElementById("bid-amount").value;
       await auctionContract.bid(id, {value: amount})
           .then(() => alert("Success"))
           .catch((error) => {
               if (error.data) alert(error.data.message);
               else alert(error);
           });
   }
   ```
---

### 🔵 **Cerințe Opționale**

1. **Tratarea eventurilor (Observer Pattern)**  
   - Contractul ascultă eventuri și actualizează interfața în timp real:
   ```javascript
   async function setupEventListeners() {
       await getAccess();

       auctionContract.on("List", (lister, nft, nftId, listingId, minPrice, endTime, timestamp) => {
           console.log(`NFT ${nftId} listed at ${minPrice} ETH by ${lister}`);
           alert(`New listing: NFT ${nftId} at ${minPrice} ETH`);
       });

       auctionContract.on("Bid", (bidder, listingId, amount, timestamp) => {
           console.log(`New bid of ${ethers.utils.formatEther(amount)} ETH from ${bidder} on listing ${listingId}`);
           alert(`New bid: ${ethers.utils.formatEther(amount)} ETH from ${bidder}`);
       });
   }
   setupEventListeners();
   ```

2. **Control al stării tranzacțiilor (tratare excepții)**  
   - Gestionarea erorilor la trimiterea tranzacțiilor:
   ```javascript
   try {
       let tx = await auctionContract.list(nftAddress, id, minPrice, duration);
       await tx.wait();
       alert("Success! NFT Listed.");
   } catch (error) {
       console.error("List Error:", error);
       if (error.data) alert(error.data.message);
       else alert(error);
   }
   ```

