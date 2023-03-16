// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeMath} from '@openzeppelin/contracts/utils/math/SafeMath.sol';
import {UUPSUpgradeable} from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {ReentrancyGuardUpgradeable} from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import {IUniswapV2Factory} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import {IUniswapV2Pair} from '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import {AggregatorV3Interface} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

import {WadMath} from './libraries/WadMath.sol';
import {IRewardToken} from './interfaces/IRewardToken.sol';
import 'hardhat/console.sol';

error TransferFailError();
error NoRewardsError();

contract Staking is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeMath for uint256;
    using WadMath for uint256;

    IRewardToken private _rewardToken;
    IUniswapV2Factory private _uniswapV2Factory;
    address private _quote; 
    uint256 constant private REWARD_RATE=1000;
  
    uint256 private _lastUpdateBlock;
    uint256 private _rewardsPerTokenStaked;
    address[] private _allowedTokens;
   
    mapping (address => mapping (address => uint256)) private _userStakedBalance;
    mapping (address => uint256) private _balances;
    mapping(address => bool) private _isTokenAllowed;
    mapping(address => mapping (address => uint256)) private _rewardPerTokenPaid;
    mapping(address => mapping (address => uint256)) private _rewards;
    
    event AddToken(address token, bool isAllowed);
    event Stake(address indexed user, address token, uint256 amount);
    event Withdraw(address indexed user, address token, uint256 amount);
    event ClaimRewards(address indexed user, address token, uint256 amount);
    
    function initialize(address rewardTokenAddress_, address uniswapV2Factory_, address quote_) external initializer{
        __Ownable_init();
        __ReentrancyGuard_init();
        _rewardToken = IRewardToken(rewardTokenAddress_);
        _uniswapV2Factory = IUniswapV2Factory(uniswapV2Factory_);
        _quote = quote_;

    }
    
    function  _authorizeUpgrade(address) internal override onlyOwner{}
    
    modifier wrongAddress(address token_){
        require(token_ != address(0), 'Wrong address provided');
        _;
    }
    modifier isTokenAllowed(address token_){
        require(_isTokenAllowed[token_], 'token not allowed');
        _;
    }

    modifier update(address account_, address token_){
        _rewardsPerTokenStaked = rewardPerToken();
        _lastUpdateBlock = block.number;
        _rewards[account_][token_] = earned(account_, token_);
        _rewardPerTokenPaid[account_][token_] =_rewardsPerTokenStaked;
        _;
    }

    function addToken(
        address token_
    ) external onlyOwner wrongAddress(token_){
        console.log('addToken called'); 
        _allowedTokens.push(token_);
        _isTokenAllowed[token_] = true;
        emit AddToken(token_, true);
    }

    function stake(
        address token_,
        uint amount_
        ) external wrongAddress(token_) isTokenAllowed(token_) update(msg.sender, token_) nonReentrant{
            require(amount_ > uint(0), 'Amount should greater than zero');
            _userStakedBalance[msg.sender][token_] += amount_;
            _balances[token_] += amount_;
            
            bool result = IERC20(token_).transferFrom(msg.sender, address(this), amount_);
            if(!result) revert TransferFailError();
            emit Stake(msg.sender, token_, amount_);
            
    }

    function withdraw(
        address token_,
        uint256 amount_
        ) external wrongAddress(token_) isTokenAllowed(token_) update(msg.sender, token_) nonReentrant{
            uint256 withdrawAmount = amount_ == type(uint).max ? _userStakedBalance[msg.sender][token_] : amount_;
            require(amount_ > 0, 'Amount should greater than zero');
            require(_userStakedBalance[msg.sender][token_] >= withdrawAmount, 'Not enough balance');
            require(_balances[token_] >= withdrawAmount, 'Not enough balance');

           
            _userStakedBalance[msg.sender][token_] -= withdrawAmount;
            _balances[token_] -= withdrawAmount;
            bool result = IERC20(token_).transfer(msg.sender, withdrawAmount);
            if(!result) revert TransferFailError();
            emit Withdraw(msg.sender, token_, withdrawAmount);
    }

    function claimRewards(
        address token_
    ) external wrongAddress(token_) isTokenAllowed(token_) update(msg.sender, token_) nonReentrant{
        uint amount =  earned(msg.sender, token_);
        if(amount <= 0) revert NoRewardsError();

        _rewards[msg.sender][token_] = 0;
        bool result = _rewardToken.transfer(msg.sender,  amount.add(_rewardToken.balanceOf(msg.sender)));
        if(!result) revert TransferFailError();

        emit ClaimRewards(msg.sender, token_, amount);
    }

    function getUserStake( address token_) external view returns(uint256){
        return _userStakedBalance[msg.sender][token_];
    }

    function getTotalSupplyInEth() private view returns(uint256){
        uint256 length = _allowedTokens.length;
        uint256 totalSupply;
        for(uint256 i=0; i<length; i++){
            address token = _allowedTokens[i];
            if(_isTokenAllowed[token]){
                totalSupply += getEthValue(token, _balances[token]);
            }
        }

        return totalSupply;
    }

    function getEthValue(address token_, uint256 amount) private view isTokenAllowed(token_)  returns(uint256){
        address pairAddress = _uniswapV2Factory.getPair(token_, _quote);
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairAddress).getReserves();

        return WadMath.wadMul(
            amount, 
            WadMath.getWad().div(uint256(reserve1).div(uint256(reserve0)))
        );
        
    }

    function rewardPerToken() private view returns(uint256) {
        uint256 totalSupply = getTotalSupplyInEth();
        if(totalSupply == uint(0)){
            return _rewardsPerTokenStaked;
        }
        
        return _rewardsPerTokenStaked + (((block.number - _lastUpdateBlock)*REWARD_RATE*WadMath.getWad())/totalSupply);
    }

    function earned(address account_, address token_) public view returns(uint256){ 
        uint balanceInEth = getEthValue(token_, _userStakedBalance[account_][token_]);

        return WadMath.wadMul(balanceInEth, (rewardPerToken() - _rewardPerTokenPaid[account_][token_])).add(
            _rewards[account_][token_]
        );
    }
    
    function getUsdValue (address priceFeed_, uint256 amount_) external view returns(uint256){
        if(amount_<= 0) return 0;
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeed_);
        (,int256 answer,,,) = priceFeed.latestRoundData();
        assert(answer > int(0));
        uint256 price = uint256(answer*1e10);

        return  WadMath.wadMul(amount_, price);
    }

}