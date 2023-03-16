import { providers, BigNumberish, Contract, utils, constants, ContractInterface} from "ethers"
//import { ContractRunner } from "ethers/types/providers"
import { Dispatch } from "react"
import { AnyAction } from "redux"
import { alertSuccess } from "../store/actions/alert-actions"

export const isMetaMaskInstalled = window.ethereum?.isMetaMask || false
export const isAccountUnlocked = window.ethereum?._metamask.isUnlocked()


export const connectAccount = async ()=>{
    try {
        const account = await window.ethereum?.request({ method: 'eth_requestAccounts' })
        return account
    } catch (error:any) {
        if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log('Please connect to MetaMask.');
          } else {
            console.error(error);
          }
    }
    
}

export const provider =  window?.ethereum && isMetaMaskInstalled && new providers.Web3Provider(window.ethereum as any)

export const getAccount = async (provider: providers.Web3Provider)=>{
    const account = provider && await provider.send("eth_accounts", [ ])
    
    if(account?.length){
        return account[0]
    }
    return null
}

export const getChainId = async(provider: providers.Web3Provider)=>{
    const chainId = provider && (await provider.getNetwork()).chainId
    return Number(chainId.toString())
}

export const toEther = (value:BigNumberish)=>utils.formatEther(value)
export const toWei = (value:string)=>utils.parseUnits(value, 18)

export const getBalance = async(account: string)=>{
    if(account.length){
        const balance = provider && await provider.getBalance(account)
        return toEther(balance) 
    }
    
    return '0.00'    
}

const reloadPage = ()=>{
    window.location.reload()
}

export const subscribMetamaskEvents = (callBack:()=>void)=>{
    const {ethereum} = window
    ethereum?.on('chainChanged',reloadPage)
    //ethereum.on('accountsChanged', callBack)
    ethereum?.on('accountsChanged', reloadPage)
}

export const removeMetamaskEvents = (callBack:()=>void)=>{
    const {ethereum} = window
    ethereum?.removeListener('chainChanged', reloadPage)
    //ethereum.removeListener('accountsChanged', callBack)
    ethereum?.removeListener('accountsChanged', reloadPage)
}

export const loadContract = (address:string, abi:ContractInterface, runner: providers.Web3Provider )=>{  
    return new Contract(address, abi, runner) as any
}

export const loadArtifacts = ()=>{
    return{
        stakingContractABI: require('../contracts-build-directory/staking-contract/abi.json').abi,
        stakingContractAddress: require('../contracts-build-directory/staking-contract/address.json').address
    }
}

export const subscribeToEvent = (
    staking:Contract, 
    eventName:string,
    dispatch: Dispatch<AnyAction>,
    actionType:AnyAction
    )=>{
        staking.on(eventName, (...args)=>{
            const event = args[args.length-1]
            dispatch(actionType)
            dispatch(alertSuccess('Transaction completed'))
            event.removeListener()
        })
}

export const fetchEventData = async(
    staking:Contract, 
    eventName:string,
    dispatch: Dispatch<AnyAction>,
    actionType:(d: (utils.Result | undefined)[]) => AnyAction,
    provider: providers.Web3Provider
    )=>{
        
        const currentBlock = await provider.getBlockNumber()
        const events = await staking.queryFilter(eventName , 0, currentBlock)
        const data = events.map(event=>event.args) || []
        dispatch(actionType(data))
}


export const formatAmount = (amount:string, balance:string)=>{
    if(amount === balance) return constants.MaxUint256
    if(amount !== balance) return toWei(amount)
}

export const customSubstring = (balanceString:string|undefined, toFixed:number)=>{
    if(balanceString)return balanceString?.slice(0, balanceString.split('.')[0].length + toFixed) || '0.00'
    return '0.00'
}