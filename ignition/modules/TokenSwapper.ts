import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const UNISWAPV3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UNISWAPV3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const CURVEFI_WETHUSDT_POOL = "0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5";

const TokenSwapperModule = buildModule("TokenSwapperModule", (m) => {
  const tokenSwapper = m.contract("TokenSwapper", [
    UNISWAPV2_ROUTER,
    UNISWAPV3_ROUTER,
    SUSHISWAP_ROUTER,
    UNISWAPV3_QUOTER,
    CURVEFI_WETHUSDT_POOL,
    0, //USDT index in Curve Pool
    2 //WETH index in Curve Pool
  ]);

  return { tokenSwapper };
});

export default TokenSwapperModule;
