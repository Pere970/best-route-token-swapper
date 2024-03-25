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
Modify the networks configuration under hardhat.config.ts to set the desired url and block to fork from:
```
hardhat : {
    forking: {
        url: <Alchemy URL to mainnet>,
        blockNumber: <Desired blocknumber to fork from, remove this property if latest is desired>
    }
}
```
## Commands
Compile smart contracts with hardhat:
```
npx hardhat compile
```

### Testing Instructions

In order to execute the unit tests, run the following command:
```
npx hardhat test  
```