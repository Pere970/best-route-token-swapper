import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const UNISWAPV3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UNISWAPV3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const TokenSwapperModule = buildModule("TokenSwapperModule", (m) => {
  const tokenSwapper = m.contract("TokenSwapper", [
    UNISWAPV2_ROUTER,
    UNISWAPV3_ROUTER,
    SUSHISWAP_ROUTER,
    UNISWAPV3_QUOTER
  ]);

  return { tokenSwapper };
});

export default TokenSwapperModule;
