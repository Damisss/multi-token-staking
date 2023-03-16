import { Field, Form } from 'formik'
import { ChangeEventHandler, FunctionComponent, useEffect, useState } from 'react'
import cx from 'classnames'
import { Contract, providers } from 'ethers'

import { CustomButton } from '../custom-button'
import { CustomInput } from '../custom-input'
import { assets, faucet } from '../../utils/config'
import { getChainId } from '../../utils/helper'

//this should be in config file
const ERC20_ABI = ["function mint(address to, uint256 amount) external returns (bool)"]

type StakeAndWithdrawCardComponent = {
    tokenSymbol:string
    setFieldValue: (filedName: string, value: string) => {}
    handleChange: ChangeEventHandler<HTMLInputElement>
    values:{ 
        token:string
        amount:number
    }
    tokenAddress:string
    balances:{
        walletBalance?:string 
        stakedBalance?:string 
    }
    provider:providers.Web3Provider
}

export const StakeAndWithdrawCardComponent:FunctionComponent<StakeAndWithdrawCardComponent> = ({
    tokenSymbol,
    handleChange,
    setFieldValue,
    values,
    tokenAddress,
    balances,
    provider,
    ...otherProps
})=>{
    
    const [selectedOption, setSelectedOption] = useState<string|undefined>('Stake')
    const [chainId, setChainId] = useState<string|undefined>()

    const onSetToken = ()=>{
        setFieldValue('option', selectedOption as string)
    }

    const onSelectOption = (opt?:string)=>{
        setSelectedOption(opt)
    }

    const onMax = ()=>{
        setFieldValue('maxAmountSelected', 'max')
        if(selectedOption === 'Stake'){
            setFieldValue('amount', balances?.walletBalance || '')
        }
        if(selectedOption === 'Withdraw'){
            setFieldValue('amount', balances.stakedBalance || '')
        }
    }
    const isFaucetDisplayed = ()=>{
        if(
            chainId && 
            chainId === '5' && 
            selectedOption
        ) return selectedOption === 'Stake'
        return false
    }
    const onFaucet = async()=>{
        if(tokenAddress && chainId){
            const signer = await provider.getSigner()
            const tokenContract = new Contract(tokenAddress, ERC20_ABI) as any
            const tx = await tokenContract.connect(signer).mint(
                await signer.getAddress(), 
                faucet[chainId][tokenAddress]
            )
            await tx.wait()
        }
    }

    useEffect(()=>{
        const asyncCall = async()=>{
            setChainId((await getChainId(provider))?.toString())
        }
        asyncCall()
    }, [chainId])

    return(
        <>
        <div className="h-full w-full">
            <div className='flex items-center justify-center mb-4'>
                <span>
                    <img 
                        src={chainId&&assets[chainId][tokenAddress]}  
                        alt={'icon'} 
                        className='h-8 w-8 rounded-full bg-contain bg-center mr-2'
                    />
                </span>
                <span className='text-xl fond-semibold'>{tokenSymbol}</span>
            </div>
            <div className='flex justify-around border-solid border-b-2 mb-2'>
                <div onClick={()=>onSelectOption('Stake')}
                className={
                    cx("flex justify-center text-semibold cursor-pointer w-full border-solid border-b-2", 
                    {'border-b-blue-400': selectedOption === 'Stake'})}
                >
                    {'Stake'}
                </div>
                <div onClick={()=>onSelectOption('Withdraw')} className={
                    cx("flex justify-center text-semibold cursor-pointer  w-full border-solid border-b-2", 
                    {'border-b-blue-400': selectedOption === 'Withdraw'})
                }>
                    {'Withdraw'}
                </div>
            </div>

            <Form className='px-4'>
            <div className="w-full">
                <Field
                    Name='amount'
                    component={CustomInput}
                    id='amount'
                    label='Amount'
                    onChange={handleChange}
                    value={values.amount}
                    type='text'
                    onMax={onMax}
                    {...otherProps}
                />
                </div>
                <CustomButton
                    className="bg-blue-400 py-1 px-4 rounded-md mt-1 w-1/2 h-full text-white mx-auto mb-4"
                    name={`${selectedOption} ${tokenSymbol}` as string}
                    onClick={onSetToken}
                    type='submit'
                    disabled={!values.amount}
                />
            </Form>
            {isFaucetDisplayed() &&
                <span className="flex justify-center w-full font-bold mb-4" 
                    onClick={onFaucet}>
                        faucet
                </span>
            }
        </div>
        
        </>
    )
}