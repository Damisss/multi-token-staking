import { BigNumberish } from "ethers"
import { toWei } from "./helper"

export const assets:{[key: string]: {[key: string]:string|undefined}}  = {
    '1':{
        'linkAddress':require('../assets/LINK.svg').default ,
        'wbtcAddress':require('../assets/WBTC.svg').default  
    },
    '137':{
        'linkAddress':require('../assets/LINK.svg').default ,
        'wbtcAddress':require('../assets/WBTC.svg').default  
    },
    '5':{
        '0xFBC1867c2B039c60725754f50c7F3724caF25437':require('../assets/LINK.svg').default ,
        '0xAb559Eb4EFBEe7E07EC7b027C9AFc30AE2FBE827':require('../assets/WBTC.svg').default 
    },
    '31337':{
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063':require('../assets/DAI.svg').default
    }
}

export const faucet:{[key: string]: {[key: string]:BigNumberish}}  ={
    '5':{
        '0xAb559Eb4EFBEe7E07EC7b027C9AFc30AE2FBE827': toWei('.2'), //WBTC
        '0xFBC1867c2B039c60725754f50c7F3724caF25437':toWei('100') //LINK
    }
}

export const priceFeedAddresses:{[key: string]: {[key: string]:string}} = {
    '5':{
        '0xFBC1867c2B039c60725754f50c7F3724caF25437': '0x48731cF7e84dc94C5f84577882c14Be11a5B7456',
        '0xAb559Eb4EFBEe7E07EC7b027C9AFc30AE2FBE827':'0xA39434A63A52E749F02807ae27335515BA4b07F7',
       
    },
    '31337':{
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063':'0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D'
       
    }
}