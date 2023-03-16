import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";
import { allowedTokens } from "./config";
require("dotenv").config();

const STAKING_CONTRACT_ABI= require('../contracts-build-directory/staking-contract/abi.json').abi
const STAKING_CONTRACT_ADDRESS= require('../contracts-build-directory/staking-contract/address.json').address
const DAI_WHALE = '0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8'
const ERC20_ABI = require('./IERC20.json').abi
const main = async ()=>{
   
   
    if(network.name === 'localhost') {
        
        const accounts = await ethers.getSigners()
        const provider =   new ethers.providers.JsonRpcProvider('http://localhost:8545/')
        const staking = new Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, accounts[0])
        //impersonateAccount Whale's account and then transfer some dai into hardhat first account.
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [DAI_WHALE]
        })
        
        const daiWhale = await ethers.getSigner(DAI_WHALE)
        const dai = new Contract(
            process.env.DAI as string, 
            ERC20_ABI,
            daiWhale
        )
        
       await dai.connect(daiWhale).transfer(accounts[0].address, ethers.utils.parseUnits('1000', 18));
        
        const tx  = await staking.connect(accounts[0]).addToken(
            process.env.DAI as string,
            //{gasLimit:5000000, gasPrice: ethers.utils.parseUnits('200', 'gwei')}
        )
        const result =  await tx.wait()
        console.log(result)
        

        

    }else if(network.name === 'goerli'){
        const provider = new ethers.providers.WebSocketProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_TESTNET_API_KEY}`)
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)
        const staking = new Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer)
        
        for(let token of allowedTokens.goerli){
            try {
                const tx  = await staking.connect(signer).addToken(
                    token,
                    //{gasLimit:5000000}
                )
                const result = await tx.wait()
        
                console.log(result)
            } catch (error) {
                console.log(error)
            }
        }
    }

    
}

main().then(()=>{
    process.exit(0)
}).catch((error)=>{
    console.error(error)
    process.exitCode = 1
    process.exit(1)
})




//goerli
//deployment wbtc:   0x97c938f9f56Fb3aDE6432c636c0DD01D4c43Cd28
//deployment link:   0x0D6F014535C9D83654D583a0eA898789Ee4F3874
//dai:0xE670094e0c97e96C9Cc4bC17c98FfACdfDbcE547