import { FunctionComponent, useEffect, useState, useRef, MutableRefObject } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import millify from 'millify'

import { Modal } from '../modal'
import {StakeAndWithdrawPanel} from '../stake-withdraw-card'
import { alertFail, alertProcessing } from '../../store/actions'
import { assets } from '../../utils/config'
import { customSubstring, getChainId, provider, subscribeToEvent } from '../../utils/helper'
import { Balances, CustomConnect, State } from '../../utils/types'
import { CustomButton } from '../custom-button'
import { withdrawSuccess, claimRewardFail, claimRewardStart } from '../../store/actions'

type AssetComponent = {
    tokenAddress:string
    tokenSymbol:string
}

export const AssetComponent:FunctionComponent<AssetComponent> = ({
    tokenAddress,
    tokenSymbol
})=>{
    const {
        contract:{staking},
        alert:{isSuccess, isProcessing}, 
        balances:{balances, isLoaded},
        claimRewards
    } = useSelector((state:State)=>state)
    const dispatch = useDispatch()
    const [showStakeModal, setStakeShowModal] = useState(false)
    const [currentBalances, setCurrentBalances] = useState<Balances>({})
    const [chainId, setChainId] = useState<string|undefined>()
    const modalRef = useRef(null) as MutableRefObject<HTMLElement | null>
    
    const onModalShow = ()=>{
        setStakeShowModal(true)
    }
    
    const onCloseModal = (e:any)=>{
        if (modalRef.current && !modalRef.current!.contains(e.target)) {
            setStakeShowModal(false)
        }
        
    }

    const onCloseButtonClicked = ()=>{
        setStakeShowModal(false)
    }
   
    const onClaimRewards = async()=>{
       try {
        dispatch(claimRewardStart)
       
        const signer = provider.getSigner()
        const tx = await (staking.connect(signer) as CustomConnect).claimRewards(tokenAddress)
        await tx.wait()
       } catch (error) {
        dispatch(claimRewardFail)
        dispatch(alertFail('Transaction Failed'))
       }
        
    }

    useEffect(()=>{
        document.addEventListener('click', onCloseModal, true);
        const asyncCall = async()=>{
            setChainId((await getChainId(provider)).toString())
        }
        asyncCall()
        
        const currBalances = balances.find(item=>item.tokenAddress === tokenAddress)
        setCurrentBalances({
            walletBalance: customSubstring(currBalances?.walletBalance, 3) || '0.00',
            stakedBalance: customSubstring(currBalances?.stakedBalance, 3) || '0.00',
            rewardsBalance: currBalances?.rewardsBalance || '0.00',
            walletBalanceInUsd: millify(+customSubstring(currBalances?.walletBalanceInUsd, 3)) || '0.00',
            stakedAmountInUSD: millify(+customSubstring(currBalances?.stakedAmountInUSD, 3)) ||  '0.00',
        } ||{})
        if(claimRewards.submitting){
            dispatch(alertProcessing('Transaction Pending'))
        }
        
        return () => {
            document.removeEventListener('click', onCloseModal, true)
        };
        
    }, [
        showStakeModal,
        isSuccess,
        isLoaded,
        isProcessing,
        currentBalances.walletBalance,
        currentBalances.rewardsBalance
    ])

    return(
        <div className=" lg:flex cursor-pointer items-center">
            <div  onClick={()=>onModalShow()} className="flex flex-1 flex-row justify-between items-center mr-6">
                <div className='flex items-center w-full'>
                    <span className='bg-white'>
                        <img 
                            src={chainId&&assets[chainId][tokenAddress as string]} 
                            alt={'icon'} 
                            className='h-8 w-8 rounded-full bg-contain bg-center mr-2'
                        />
                    </span>
                    <span className="font-semibold">{tokenSymbol}</span>
                </div>
                <div className="flex flex-col text-end w-full md:text-center" >
                    <span className="font-semibold" >{`$${currentBalances.walletBalanceInUsd}`}</span>
                    <span >{`${currentBalances.walletBalance} ${tokenSymbol}`}</span>
                </div>
                <div className="hidden md:flex flex-col text-end w-full md:text-center" >
                    <span className="font-semibold" >{`$${currentBalances.stakedAmountInUSD}`}</span>
                    <span >{`${currentBalances.stakedBalance} ${tokenSymbol}`}</span>
                </div>
            </div>
            <div>
                <CustomButton
                    name='Claim Rewards'
                    type='button'
                    onClick={onClaimRewards}
                    disabled={currentBalances.rewardsBalance && parseFloat(currentBalances.rewardsBalance) <= 0 || false}
                    className="m-2 p-2 rounded-full p-2 rounded text-white"
                />
            </div>
            <Modal 
                onClose={onCloseButtonClicked} 
                showModal={showStakeModal} 
                ref={modalRef}
            >
                <>
                {
                    showStakeModal && <StakeAndWithdrawPanel
                        tokenSymbol={tokenSymbol}
                        staking={staking}
                        provider={provider}
                        dispatch={dispatch}
                        onClick={onCloseButtonClicked}
                        tokenAddress={tokenAddress}
                        balances={currentBalances}
                    />
                }
                </>
                
            </Modal>
            
        </div>
    )
}