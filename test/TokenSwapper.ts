import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";


  import { expect } from "chai";
  import { ethers } from "hardhat";
  import hre from "hardhat";
  import { token } from "../typechain-types/@openzeppelin/contracts";
  
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const UNISWAPV3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const UNISWAPV3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

  describe("TokenSwapper", function () {
    it("Swaps using the router giving the biggest amount of stablecoin", async function () {
      const accounts = await ethers.getSigners();

      const weth = await ethers.getContractAt("IWETH", WETH);
      const dai = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI);

      const TokenSwapper = await ethers.getContractFactory("TokenSwapper");
      const tokenSwapper = await TokenSwapper.deploy(
        UNISWAPV2_ROUTER,
        UNISWAPV3_ROUTER,
        SUSHISWAP_ROUTER,
        UNISWAPV3_QUOTER
      );
      await tokenSwapper.waitForDeployment();

      const amountIn = 10n ** 18n;

      await weth.connect(accounts[0]).deposit({ value: amountIn});
      await weth.connect(accounts[0]).approve(tokenSwapper.getAddress(), amountIn);

      const tx = await tokenSwapper.cheapestRouteUSDTSwap(amountIn);

      const txResult = await tx.wait();
      
      const emittedEvents = txResult?.logs.map((log) => tokenSwapper.interface.parseLog(log));
      const quotedBalancesEvent = emittedEvents?.find(x => x?.name === "QuotedBalances");
      const tokenSwapEvent = emittedEvents?.find(x => x?.name === "TokenSwap");

      const quotedBalances = quotedBalancesEvent?.args[0].map((n: BigInt) => Number(n)); //From BigInt to Number
      const biggestQuoteIndex = quotedBalances.indexOf(Math.max(...quotedBalances));
      
      switch(biggestQuoteIndex){
        case 0:
          expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV2_ROUTER);
          break;
        case 1:
          expect(tokenSwapEvent?.args[2]).to.equal(SUSHISWAP_ROUTER);
          break;
        default:
          expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV3_ROUTER);
          break;
      }

      expect(await dai.balanceOf(accounts[0].address)).greaterThan(0);
    });
  });
  