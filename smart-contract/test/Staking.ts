import { ethers, network, upgrades } from 'hardhat'
import { utils, Contract, constants } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {time, mine} from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'

const ERC20_ABI = require('./IERC20.json').abi

const toWei = (value:string)=> utils.parseUnits(value, 18)

describe('staking',()=>{
    const DAI_WHALE = '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8'
    const AAVE_WHALE = '0x896078A63A1878b7FDc8DBA468C9A59b94fd7a92'
    let staking: Contract
    let dai: Contract
    let aave: Contract
    let rewardToken: Contract
    let deployer: SignerWithAddress
    let OtherAccount: SignerWithAddress[]
    let daiWhale: SignerWithAddress
    let aaveWhale: SignerWithAddress
  
    beforeEach(async() => {
        // And get signers here
        [deployer, ...OtherAccount] = await ethers.getSigners()
        // Deploy contracts 
        const WadMath = await ethers.getContractFactory('WadMath')
        const wadMath = await WadMath.deploy()

        const RewardToken = await ethers.getContractFactory('RewardToken')
        rewardToken = await RewardToken.deploy('Reward Token', 'SAM')

        const Staking =  await ethers.getContractFactory('Staking', {
            libraries:{
                WadMath:wadMath.address
            }
        })
        staking = await upgrades.deployProxy(Staking,
            [rewardToken.address, process.env.SHUSHI_FACTORY, process.env.QUOTE], 
            {
                initializer:'initialize',
                unsafeAllowLinkedLibraries:true
            }
        )
        
        dai = new ethers.Contract(process.env.DAI as string, ERC20_ABI, deployer)
        aave = new ethers.Contract(process.env.AAVE as string, ERC20_ABI, deployer)

        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [DAI_WHALE]
        })
    
        daiWhale = await ethers.getSigner(DAI_WHALE)
    
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [AAVE_WHALE]
        })
        
        aaveWhale = await ethers.getSigner(AAVE_WHALE)
        const tx =  await staking.addToken(process.env.DAI as string)
        await tx.wait()
    })
    
    it('should check contract address', ()=>{
        expect(staking.address).to.exist
    })
    
    describe('stake', ()=>{
        it('should revert if wrong token is provided', async()=>{
            await expect(
                staking.connect(daiWhale).stake(constants.AddressZero, toWei('100'))
            ).to.be.revertedWith('Wrong address provided')
        })

        it('should revert if token is not allowed', async()=>{
            await expect(
                staking.connect(aaveWhale).stake(process.env.AAVE, toWei('100'))
            ).to.be.revertedWith('token not allowed')
        })

        it('should revert if zero amount is provided', async()=>{
            await expect(
                staking.connect(daiWhale).stake(process.env.DAI, toWei('0'))
            ).to.be.revertedWith('Amount should greater than zero')
        })

        it('should stake the token', async()=>{
            await dai.connect(daiWhale).approve(staking.address, toWei('1000'))
            const tx = await staking.connect(daiWhale).stake(
                process.env.DAI, toWei('1000'),
                {
                    gasLimit:300000
                }
            )
            const result = await tx.wait()
            const event = result.events[2].args
            expect(daiWhale.address).to.eql(event[0])
            expect(dai.address).to.eql(event[1])
            expect(toWei('1000')).to.eql(event[2])
        })
    })

    describe('withdraw', ()=>{
        const stakToken = async()=>{
            await dai.connect(daiWhale).approve(staking.address, toWei('1000'))
            await staking.connect(daiWhale).connect(daiWhale).stake(
                process.env.DAI, toWei('1000'),
                {
                    gasLimit:300000
                }
            )
        }
        it('should revert if wrong token is provided', async()=>{
            await stakToken()
            await expect(
                staking.connect(daiWhale).withdraw(constants.AddressZero, toWei('100'))
            ).to.be.revertedWith('Wrong address provided')
        })

        it('should revert if token is not allowed', async()=>{
            await stakToken()
            await expect(
                staking.connect(aaveWhale).withdraw(process.env.AAVE, toWei('100'))
            ).to.be.revertedWith('token not allowed')
        })

        it('should revert if zero amount is provided', async()=>{
            await stakToken()
            await expect(
                staking.connect(daiWhale).withdraw(process.env.DAI, toWei('0'))
            ).to.be.revertedWith('Amount should greater than zero')
        })

        it('should revert if amount is provided is greater than staked token of user', async()=>{
            await stakToken()
            await expect(
                staking.connect(daiWhale).withdraw(process.env.DAI, toWei('1001'))
            ).to.be.revertedWith('Not enough balance')
        })

        it('should withdraw staked token', async()=>{
            
            await stakToken()
            const tx = await staking.connect(daiWhale).withdraw(
                process.env.DAI, toWei('1000'),
                {
                    gasLimit:300000
                }
            )
            const result = await tx.wait()
            const event = result.events[1].args
            expect(daiWhale.address).to.eql(event[0])
            expect(dai.address).to.eql(event[1])
            expect(toWei('1000')).to.eql(event[2])
        })
    })

    describe('claim rewards', ()=>{
        
        const stakeToken = async()=>{
            await aave.connect(aaveWhale).approve(staking.address, toWei('100'))
            const tx  = await staking.connect(aaveWhale).stake(
                process.env.AAVE, toWei('100'),
                {
                    gasLimit:300000
                }
            )
            await tx.wait()
            
        }
        it('should revert if wrong token is provided', async()=>{
            await expect(
                staking.connect(daiWhale).claimRewards(constants.AddressZero)
            ).to.be.revertedWith('Wrong address provided')
        })

        it('should revert if token is not allowed', async()=>{
            await expect(
                staking.connect(aaveWhale).claimRewards(process.env.AAVE)
            ).to.be.revertedWith('token not allowed')
        })

        it("should revert if user's rewards for that token is zero", async()=>{
            await expect(
                staking.connect(daiWhale).claimRewards(process.env.DAI)
            ).to.be.reverted
        })

        it('should claim rewards', async()=>{
            const tx2 =await rewardToken.connect(deployer).mint(staking.address, toWei('100000'), {gasLimit:5000000})
            await tx2.wait()
            const tx1 =  await staking.addToken(process.env.AAVE as string)
            await tx1.wait()

            await stakeToken()

            const earnedBefore =  await staking.connect(aaveWhale).earned(aaveWhale.address, aave.address)
            
            // const SECONDS_IN_A_DAY = 86400
            // await network.provider.send("evm_increaseTime", [SECONDS_IN_A_DAY]);
            for (let index = 0; index < 10; index++) {
                await network.provider.send("evm_mine", []);
            }

            const rewardTokenBalanceBefore = await rewardToken.balanceOf(aaveWhale.address)
            const tx3 = await staking.connect(aaveWhale).withdraw(
                process.env.AAVE, toWei('100'),
                {
                    gasLimit:300000
                }
            )
            await tx3.wait()
          
            
            const earnedAfter =  await staking.connect(aaveWhale).earned(aaveWhale.address, aave.address)
            const tx = await staking.connect(aaveWhale).claimRewards(aave.address, {gasLimit:5000000})
            const result = await tx.wait()
    
            const rewardTokenBalanceAfter = await rewardToken.balanceOf(aaveWhale.address)
            const event = result.events[1].args
            
            expect(aaveWhale.address).to.eql(event[0])
            expect(aave.address).to.eql(event[1])
            expect(
                rewardTokenBalanceAfter-rewardTokenBalanceBefore
            ).to.eql(+event[2].toString())
            expect('0').to.eql(earnedBefore.toString())
            expect(earnedAfter).to.eql(rewardTokenBalanceAfter)
        })
    })
})