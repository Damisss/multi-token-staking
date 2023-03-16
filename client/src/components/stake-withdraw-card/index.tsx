import { withFormik } from 'formik'
import { Dispatch } from 'react'
import { Action } from 'redux'
import { Contract, providers } from 'ethers'
import {Big} from 'big.js'

import { StakeAndWithdrawCardComponent } from './stake-withdraw-card-component'
import { formatAmount, loadContract, toWei } from '../../utils/helper'
import { stakeStart, stakeFail, alertFail, alertProcessing, withdrawFail, withdrawStart} from '../../store/actions'
import { CustomConnect } from '../../utils/types'

const ERC20ABI = require('../../utils/IERC20.json').abi

type MyFormProps={
    initialAmount?:string
    initialToken?: string
}

type FormValues ={
    amount:string
    option:string

}
type AdditionalProps = {
    provider?:providers.Web3Provider
    staking?: Contract
    dispatch: Dispatch<Action>
    tokenSymbol:string
    tokenAddress?:string
    onClick: ()=>void
    balances:{
        stakedBalance?:string, 
        walletBalance?:string, 
    }
}

export const StakeAndWithdrawPanel = withFormik<MyFormProps & AdditionalProps, FormValues>({
    mapPropsToValues: props => {

        return ({
            amount: props.initialAmount || '',
            option:  props.initialToken || ''
        })
    },
    async handleSubmit({ amount, option}: FormValues, { setSubmitting, props }) {
        props.onClick()

        if(parseFloat(amount) > 0 && props.staking && props.provider){
            const signer = await props.provider.getSigner()
            const loadERC20 = loadContract(props.tokenAddress as string, ERC20ABI, props.provider)
            switch (option) {
                case 'Stake':
                    try {
                        props.dispatch(stakeStart)
                        props.dispatch(alertProcessing('Transaction Pending'))
                        const approveTx = await loadERC20.connect(signer).approve(props.staking.address, toWei(amount.toString()))
                        await approveTx.wait()
                        const tx = await (props.staking?.connect(signer) as CustomConnect).stake(
                            props.tokenAddress as string,
                            toWei(amount.toString()),
                        )
                        await tx.wait() 
                        
                    } catch (error) { 

                        props.dispatch(stakeFail)
                        props.dispatch(alertFail('Transaction Failed')) 
                        console.log(error)
                    }

                    break

                case 'Withdraw':
                    try {
                        props.dispatch(withdrawStart)
                        props.dispatch(alertProcessing('Transaction Pending'))
                        const tx = await  (props.staking?.connect(signer) as CustomConnect).withdraw(
                            props.tokenAddress as string,
                            formatAmount(amount.toString(), props.balances.stakedBalance as string)
                        )
                        await tx.wait()

                    } catch (error) {
                        props.dispatch(withdrawFail)
                        props.dispatch(alertFail('Transaction Failed')) 
                        console.log(error)
                    }
                    break
                

                default:
                    break
            }
            
        }
        setSubmitting(true)
    }
    

})(StakeAndWithdrawCardComponent)
