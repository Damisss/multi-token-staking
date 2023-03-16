// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IRewardToken {
    function mint(address account, uint256 amount) external;
    function burn(address account, uint256 amount) external;
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to,uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
