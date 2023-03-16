// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IStaking {
    function addToken(address token) external;
    function stake(address token,uint amount) external;
    function withdraw(address token,uint amount) external;
    function claimRewards(address token) external;
    function getUserStake( address token) external view returns(uint256);
    function earned(address account, address token) external view returns(uint256);
    function getUsdValue (address priceFeed, uint256 amount) external view returns(uint256);
}
