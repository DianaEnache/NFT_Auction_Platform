# 🎯 NFT Auction Platform
---

## ✅ Cerințe Îndeplinite

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

## 🚀 Instalare și Rulare

### 1️⃣ **Clonarea Proiectului**
```bash
git clone https://github.com/username/repository.git
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

