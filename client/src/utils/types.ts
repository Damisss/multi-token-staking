import {MetaMaskInpageProvider} from '@metamask/providers'
import { BaseContract, BigNumberish, Contract, } from 'ethers'
import {TransactionResponse} from '@ethersproject/abstract-provider'

declare global{
    interface Window{
        ethereum: MetaMaskInpageProvider
    }
}

export type CustomConnect={
    getLiquidityInUSD:(priceFeed:string, token:string)=>Promise<BigNumberish>
    getUsdValue:(priceFeed:string, amount:BigNumberish)=>Promise<BigNumberish>
    getUserStake:(token:string)=>Promise<BigNumberish>
    stake:(token:string, amount:BigNumberish, opt?:{})=>Promise<TransactionResponse>
    earned:(account:string, token:string)=>Promise<BigNumberish>
    getEarned:(account:string, token:string)=>Promise<BigNumberish>
    withdraw:(token:string, amount:BigNumberish | undefined)=>Promise<TransactionResponse>
    claimRewards:(token:string)=>Promise<TransactionResponse>
}&BaseContract

type Common ={
    loading: boolean,
    isLoaded: boolean,
    isError: boolean
}

type Account = {
    account: string,
} & Common

type Network ={
    chainId: number
} & Common

type StakingContract ={
    staking:Contract
} & Common

type StakingInterface = {
    submitting: boolean
    submitted: boolean
    isError: boolean
}

type AlertType = {
    isProcessing:boolean
    isAlert:boolean
    isShown: boolean
    isSuccess:boolean
    isError:boolean
    message: string
}
export type Balances={
    tokenAddress?:string
    walletBalance?:string
    stakedBalance?:string
    stakedAmountInUSD?:string
    walletBalanceInUsd?:string
    rewardsBalance?:string
}
export type BalanceType = {
    balances:Balances[]
    isError:boolean
    isLoaded:boolean
}
export type State = {
    account: Account
    network: Network
    contract: StakingContract
    stake: StakingInterface
    claimRewards: StakingInterface
    withdraw: StakingInterface
    alert: AlertType,
    balances: BalanceType
}
