import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenSwapper", function () {

  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const UNISWAPV3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const UNISWAPV3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
  const CURVEFI_WETHUSDT_POOL = "0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5";

  let accounts: any;
  let weth: any;
  let usdt: any;
  let tokenSwapper: any;
  let amountIn: any;

  beforeEach(async function (){
    accounts = await ethers.getSigners();

    weth = await ethers.getContractAt("IWETH", WETH);
    usdt = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", USDT);

    const TokenSwapper = await ethers.getContractFactory("TokenSwapper");
    tokenSwapper = await TokenSwapper.deploy(
      UNISWAPV2_ROUTER,
      UNISWAPV3_ROUTER,
      SUSHISWAP_ROUTER,
      UNISWAPV3_QUOTER,
      CURVEFI_WETHUSDT_POOL
    );
    await tokenSwapper.waitForDeployment();

    amountIn = 10n ** 18n;

    //We need WETH in the account in order to perform the Swaps
    await weth.connect(accounts[0]).deposit({ value: amountIn});
    await weth.connect(accounts[0]).approve(tokenSwapper.getAddress(), amountIn);
  });

  it("Swaps using the router giving the biggest amount of stablecoin", async function () {
    const tx = await tokenSwapper.cheapestRouteUSDTSwap(amountIn);
    const txResult = await tx.wait();
    
    const emittedEvents = txResult?.logs.map((log: any) => tokenSwapper.interface.parseLog(log));
    const quotedBalancesEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "QuotedBalances");
    const tokenSwapEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "TokenSwap");

    const quotedBalances = quotedBalancesEvent?.args[0].map((n: BigInt) => Number(n)); //From BigInt to Number
    const biggestQuoteIndex = quotedBalances.indexOf(Math.max(...quotedBalances));

    switch(biggestQuoteIndex){
      case 0:
        expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV2_ROUTER);
        break;
      case 1:
        expect(tokenSwapEvent?.args[2]).to.equal(SUSHISWAP_ROUTER);
        break;
      case 2:
        expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV3_ROUTER);
        break;
      default:
        expect(tokenSwapEvent?.args[2]).to.equal(CURVEFI_WETHUSDT_POOL);
        break;
    }

    expect(await usdt.balanceOf(accounts[0].address)).greaterThan(0);
  });

  it("Swaps using UniswapV2", async function () {
    const tx = await tokenSwapper.uniswapV2Swap(UNISWAPV2_ROUTER, amountIn);
    const txResult = await tx.wait();
    
    const emittedEvents = txResult?.logs.map((log: any) => tokenSwapper.interface.parseLog(log));
    const tokenSwapEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "TokenSwap");

    expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV2_ROUTER);
    expect(await usdt.balanceOf(accounts[0].address)).greaterThan(0);
  });

  it("Swaps using SushiSwap", async function () {
    const tx = await tokenSwapper.uniswapV2Swap(SUSHISWAP_ROUTER, amountIn);
    const txResult = await tx.wait();
    
    const emittedEvents = txResult?.logs.map((log: any) => tokenSwapper.interface.parseLog(log));
    const tokenSwapEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "TokenSwap");

    expect(tokenSwapEvent?.args[2]).to.equal(SUSHISWAP_ROUTER);
    expect(await usdt.balanceOf(accounts[0].address)).greaterThan(0);
  });

  it("Swaps using UniswapV3", async function () {
    const tx = await tokenSwapper.uniswapV3Swap(amountIn);
    const txResult = await tx.wait();
    
    const emittedEvents = txResult?.logs.map((log: any) => tokenSwapper.interface.parseLog(log));
    const tokenSwapEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "TokenSwap");

    expect(tokenSwapEvent?.args[2]).to.equal(UNISWAPV3_ROUTER);
    expect(await usdt.balanceOf(accounts[0].address)).greaterThan(0);
  });

  it("Swaps using CurveFi", async function () {
    const tx = await tokenSwapper.curveFiSwap(amountIn);
    const txResult = await tx.wait();
    
    const emittedEvents = txResult?.logs.map((log: any) => tokenSwapper.interface.parseLog(log));
    const tokenSwapEvent = emittedEvents?.find((x: { name: string; }) => x?.name === "TokenSwap");

    expect(tokenSwapEvent?.args[2]).to.equal(CURVEFI_WETHUSDT_POOL);
    expect(await usdt.balanceOf(accounts[0].address)).greaterThan(0);
  });
});