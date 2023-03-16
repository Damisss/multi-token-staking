import { ethers, upgrades, artifacts, network } from "hardhat";
const fs = require('fs-extra')
const path = require('path')

async function main() {
  const WadMath = await ethers.getContractFactory('WadMath')
  const wadMath = await WadMath.deploy()
 
  const RewardsToken = await ethers.getContractFactory('RewardToken')
  const rewardsToken = await RewardsToken.deploy('Reward Token', 'SAM')
  
  let  Staking =  await ethers.getContractFactory('Staking', {
    libraries:{
      WadMath:wadMath.address
    }
  })
  let factory
  let quote

  if(network.name === 'localhost'){
    factory = process.env.SHUSHI_FACTORY as string
    quote = process.env.QUOTE as string
  }else if(network.name === 'goerli'){
    factory = process.env.UNI_FACTORY_GOERLI as string
    quote = process.env.QUOTE_GOERLI as string
  }

  const staking = await upgrades.deployProxy(Staking, [rewardsToken.address, factory, quote], {
    initializer:'initialize',
    kind:'uups',
    unsafeAllowLinkedLibraries:true,
  })
  await staking.deployed()
  rewardsToken.mint(
    staking.address, 
    ethers.utils.parseUnits('10000000000', 18),
     //{gasLimit:5000000, gasPrice: ethers.utils.parseUnits('200', 'gwei')}
 )

 
  console.log(`deployment staking contract:   ${staking.address}`)
  console.log(`deployment rewards token contract:   ${rewardsToken.address}`)
  
  contractsBuild('Staking', staking.address)
}

const contractsBuild = (contractName: string, address:string): void => {
  const contractsBuildDirectory = path.join(__dirname, '..', 'contracts-build-directory/staking-contract')
  
  fs.removeSync(contractsBuildDirectory + `/abi.json`)
  fs.removeSync(contractsBuildDirectory + `/address.json`)
 
  fs.outputJsonSync(
    path.join(contractsBuildDirectory + `/address.json`),
    { address }
  )
  
  const artifact = artifacts.readArtifactSync(contractName)
  fs.outputJsonSync(
    path.join(contractsBuildDirectory + `/abi.json`),
    artifact
  )

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
  process.exit(1)
})
//staking goerli:  0x08f1886E2e8583E22b76Fb1d1e5071a50D76C124
//rewardToken goerli: 0x32c8aaf88Bf92E75Bb62c569d8321Aa3347267B4