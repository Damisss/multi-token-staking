// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
 
contract RewardToken is ERC20, Ownable{
    constructor(
        string memory name_,
        string memory symbol_
        )ERC20(name_, symbol_){}

    function mint(address account_, uint256 amount_) external onlyOwner{
        _mint(account_, amount_);
    }

    function burn(address account_, uint256 amount_) external onlyOwner{
        _burn(account_, amount_);
    }
}