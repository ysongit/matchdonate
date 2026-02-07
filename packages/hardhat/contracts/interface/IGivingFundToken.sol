// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IGivingFundToken
 * @dev Interface for the GivingFundToken contract
 */
interface IGivingFundToken {
    function burn(address from, uint256 amount) external returns (bool);
    function mintTo(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function isApprovedNonprofit(address nonprofit) external view returns (bool);
}
