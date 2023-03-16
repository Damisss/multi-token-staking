import { FunctionComponent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Staking, CustomButton } from '../../components'
import { CustomConnect, State } from '../../utils/types'
import { 
    connectAccount,
    loadContract, 
    provider, 
    toEther 
} from '../../utils/helper'
import { stakingDataSelector } from '../../store/utils/custom-selector'
import { getBalancesFail, getBalancesStart, getBalancesSuccess } from '../../store/actions'
import { priceFeedAddresses } from '../../utils/config'

const ERC20_ABI = require('../../utils/IERC20.json').abi

type AllowedAsset= {
    token:string
    isTokenAllowed: boolean
    tokenSymbol: string
}

export const StakingContainer:FunctionComponent = ()=>{
    const {stakingData} = useSelector(stakingDataSelector)
    const {
        account:{isLoaded, account, loading}, 
        contract:{staking},
        stake,
        claimRewards,
        withdraw
    } = useSelector((state:State)=>state)
    const dispatch = useDispatch()
    const [allowedTokens, setAllowedTokens] = useState<AllowedAsset[]>([])
    const [isAccountLoading, setIsAccountLoading] = useState(false)

    useEffect(()=>{
        const prepareData = async()=>{
            if(provider && account){
                const signer = await provider.getSigner()
                const {chainId} = await provider.getNetwork()
                dispatch(getBalancesStart)
                const assets:AllowedAsset[] = []
               
                for(let item of stakingData){
                    const contract = loadContract(item.token, ERC20_ABI, provider)
                    const walletBalance = await contract.balanceOf(account)
                    const tokenSymbol = await contract.symbol()
                    const stakedBalance = await (staking.connect(signer) as CustomConnect).getUserStake(item.token)

                    const rewardsBalance = await (staking.connect(signer) as CustomConnect).earned(account,item.token)
                
                    const stakedAmountInUSD = await (staking.connect(signer) as CustomConnect).getUsdValue(
                        priceFeedAddresses[chainId.toString()][item.token],
                        stakedBalance
                    )
                    
                    const walletBalanceInUSD = await (staking.connect(signer) as CustomConnect).getUsdValue(
                        priceFeedAddresses[chainId.toString()][item.token],
                        walletBalance
                    )
                
                    dispatch(
                        getBalancesSuccess({
                            tokenAddress: item.token,
                            walletBalance: toEther(walletBalance),
                            stakedBalance: toEther(stakedBalance),
                            rewardsBalance:toEther(rewardsBalance),
                            stakedAmountInUSD: toEther(stakedAmountInUSD),
                            walletBalanceInUsd: toEther(walletBalanceInUSD)
                        })
                    )
                    assets.push({
                        token: item.token,
                        isTokenAllowed: item.isTokenAllowed,
                        tokenSymbol
                    })
                   
                }
                setAllowedTokens(assets)
            }
            
        }
        
        try {
            prepareData()
        } catch (error) {
            dispatch(getBalancesFail)
        }
        const setTimeoutId = setInterval(()=>{
            prepareData()
        }, 15000)
        setIsAccountLoading(loading)
        return()=>{
           window.clearInterval(setTimeoutId)
        }
    }, [
        stakingData, 
        stake.submitted, 
        claimRewards.submitted, 
        withdraw.submitted
    ])

    const displaySupply = (data:AllowedAsset)=>{
        return data.isTokenAllowed ?
            <Staking
                key={data.token}
                tokenAddress={data.token}
                tokenSymbol={data.tokenSymbol}
            /> : null
    }

    if(isAccountLoading){
        const isWalletInstalled = window.ethereum?.isMetaMask || false
        return(
            <div className="bg-[#0f172a] py-44 flex flex-row justify-center justify-around">
                {<div className="flex flex-col bg-white items-center rounded-md border-2 shadow shadow-2xl p-12">
                    <div>
                        <h2 className="text-center text-xl font-semibold">{!isWalletInstalled? 'Install Metamask': 'Connect your Wallet'}</h2>
                        <span>Connect your wallet to see your staked and eraned.</span>
                    </div>
                    {
                    !isWalletInstalled ?
                    <CustomButton
                        className="bg-blue-400 rounded-md py-2 mx-auto text-white mt-6 w-11/12 md:w-1/2"
                        name='Install Metamask'
                        onClick={()=>window.open ('https://metamask.io', '_ blank')}
                        type='button'
                        /> :
                        <CustomButton
                            className="bg-blue-400 rounded-md py-2 mx-auto text-white mt-6 w-11/12 md:w-1/2"
                            name='Connect Wallet'
                            onClick={connectAccount}
                            type='button'
                        />
                    }
                </div>
                }
            </div>
        )
    }

    return(
        <>
           { !isAccountLoading && isLoaded?<>
                    <div className="flex justify-center w-10/12 mx-auto mt-12 lg:w-8/12">
                        <div className="flex flex-col w-full md:flex-row">
                            <div className="w-full md:mr-2">
                                <div className="bg-white rounded-md border-2 shadow shadow-2xl">
                                    <div className="flex flex-row mb-2 px-2 pt-2 mr-0 lg:mr-36">
                                        <div className='flex flex-row mb-2 px-2 pt-2 justify-between flex-1'>
                                        <div className='text-start w-full'>
                                        <span className="font-semibold">Asset</span>
                                        </div>
                                        <div className='text-end w-full md:text-center w-full'>
                                        <span className="font-semibold">Wallet</span>
                                        </div>
                                        <div className='hidden md:block text-center w-full'>
                                        <span className="font-semibold">Staked</span>
                                        </div>
                                        </div>
                                    </div>
                                    {
                                        allowedTokens.map(displaySupply)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </>:
                <div className="w-full flex justify-center align-center items-center h-full">
                    <span className="font-bold text-xl">loading...</span>
                </div>
            }
        </>
    )
}