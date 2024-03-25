import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

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
        url: <custom Alchemy/Infura endpoint>,
        blockNumber: 19503319
      }
    }
  }
};

export default config;
