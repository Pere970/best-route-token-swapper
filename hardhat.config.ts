import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config()

const MAINNET_RPC_URL =  process.env.ALCHEMY_MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/your-api-key";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.7.6",
      },
    ],
  },
  networks : {
    hardhat : {
      forking: {
        url: MAINNET_RPC_URL,
        blockNumber: 19503319
      }
    }
  }
};

export default config;
