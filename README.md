# Token Swapper
Smart contract that fetches the exchange rate for different DEXes and swaps using the one that gives the biggest output amount. Note that gas fees weren't considered for optimizing the process.

Hardhat has been used for development and forking the mainnet in order to have access to the mainnet used routers from different Decentralized Exchanges.

## Requirements
- Node.js (v12 or later)

- Alchemy Account (to get a mainnet rpc endpoint to fork the chain)

## Installing

Download the repo: 
```
git clone https://github.com/Pere970/best-route-token-swapper.git
```
Execute **npm install** to install all the needed dependencies:
```
npm install --save
```
Create a .env file in project's root folder and add the following ENV variable:
```
ALCHEMY_MAINNET_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/your_api_key"
```

(Optional) Modify blocknumber in hardhat.config.ts to the desired blocknumber or remove it for "latest":
```
hardhat : {
    forking: {
        blockNumber: <Desired blocknumber to fork from, remove this property if latest is desired>
    }
}
```
## Commands
Compile smart contracts with hardhat:
```
npm run compile
```

Deploy smart contract to blockchain: 
```
npm run deploy
```

### Testing Instructions

In order to execute the unit tests, run the following command:
```
npm run test  
```