// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import './interfaces/ICurvePool.sol';

contract TokenSwapper {
    event TokenSwap(uint amountIn, uint amountOut, address routerUsed);
    event QuotedBalances (uint[4] balances);

    address private _uniswapV2Router;
    address private _uniswapV3Router;
    address private _uniswapV3Quoter;
    address private _sushiswapRouter;
    address private _curveFiWETHUSDTPool;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint256 private _usdtIndexInCurvePool;
    uint256 private _wethIndexInCurvePool;

    uint24 public constant poolFee = 500;

    constructor (
        address uniswapV2Router,
        address uniswapV3Router,
        address sushiswapRouter,
        address uniswapV3Quoter,
        address curveFiWETHUSDTPool,
        uint256 usdtIndexInCurvePool,
        uint256 wethIndexInCurvePool
    ) {
        _uniswapV2Router = uniswapV2Router;
        _uniswapV3Router = uniswapV3Router;
        _sushiswapRouter = sushiswapRouter;
        _curveFiWETHUSDTPool = curveFiWETHUSDTPool;
        
        _uniswapV3Quoter = uniswapV3Quoter;

        _usdtIndexInCurvePool = usdtIndexInCurvePool;
        _wethIndexInCurvePool = wethIndexInCurvePool;
    }

    function fetchUniswapRouterV2Quote(address routerAddress, uint amountIn) internal view returns (uint256 amountOut){
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDT;

        return IUniswapV2Router02(routerAddress).getAmountsOut(amountIn, path)[1];
    }

    function fetchUniswapV3Quote(uint amountIn) internal returns (uint256 amountOut){
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDT;

        return IQuoter(_uniswapV3Quoter).quoteExactInputSingle(WETH, USDT, poolFee, amountIn, 0);
    }

    function fecthCurveFiQuote(uint amountIn) internal view returns (uint256 amountOut){
        amountOut = ICurvePool(_curveFiWETHUSDTPool).get_dy(_wethIndexInCurvePool, _usdtIndexInCurvePool, amountIn);
    }
    

    function fetchQuotes(uint amountIn) public returns (uint[4] memory amountsOut){
        amountsOut[0] = fetchUniswapRouterV2Quote(_uniswapV2Router, amountIn);
        amountsOut[1] = fetchUniswapRouterV2Quote(_sushiswapRouter, amountIn);
        amountsOut[2] = fetchUniswapV3Quote(amountIn);
        amountsOut[3] = fecthCurveFiQuote(amountIn);
    }

    function uniswapV3Swap(uint amountIn) public {
        TransferHelper.safeTransferFrom(WETH, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(WETH, _uniswapV3Router, amountIn);

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: USDT,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        uint amountOut = ISwapRouter(_uniswapV3Router).exactInputSingle(params);
        
        emit TokenSwap(amountIn, amountOut, _uniswapV3Router);
    } 

    function uniswapV2Swap(address routerAddress, uint amountIn) public {
        TransferHelper.safeTransferFrom(WETH, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(WETH, routerAddress, amountIn);

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDT;
        uint amountOut = IUniswapV2Router02(routerAddress).swapExactTokensForTokens(amountIn, 0, path, msg.sender, block.timestamp)[1];
        
        emit TokenSwap(amountIn, amountOut, routerAddress);
    } 

    function curveFiSwap(uint amountIn) public {
        TransferHelper.safeTransferFrom(WETH, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(WETH, _curveFiWETHUSDTPool, amountIn);

        ICurvePool(_curveFiWETHUSDTPool).exchange(_wethIndexInCurvePool, _usdtIndexInCurvePool, amountIn, 0);
        
        require(IERC20(USDT).balanceOf(address(this)) > 0, "Swap not succeeded");
        emit TokenSwap(amountIn, IERC20(USDT).balanceOf(address(this)), _curveFiWETHUSDTPool);
        TransferHelper.safeTransfer(USDT, msg.sender, IERC20(USDT).balanceOf(address(this))); //Funds need to be withdrawn
    }

    function cheapestRouteUSDTSwap(uint amountIn) public payable {
        uint256[4] memory quotes = fetchQuotes(amountIn);
        emit QuotedBalances(quotes);

        uint256 maxUsdtRate = 0;
        uint maxUsdtRateIndex = 0;
        for (uint i = 0; i <= 2; i++){
            if(quotes[i] > maxUsdtRate){
                maxUsdtRateIndex = i;
                maxUsdtRate = quotes[i];
            }
        }

        if(maxUsdtRateIndex == 0){
            uniswapV2Swap(_uniswapV2Router, amountIn);
        }
        if (maxUsdtRateIndex == 1) {
            uniswapV2Swap(_sushiswapRouter, amountIn);
        }
        if (maxUsdtRateIndex == 2){
            uniswapV3Swap(amountIn);
        }
        else{
            curveFiSwap(amountIn);
        }
    }
}