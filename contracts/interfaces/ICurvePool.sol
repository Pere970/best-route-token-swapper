// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICurvePool {
    function exchange (uint256 i, uint256 j, uint256 dx, uint256 min_dy) external;
    function get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256);
}