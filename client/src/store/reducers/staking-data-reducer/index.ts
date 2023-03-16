import {STAKING_TYPE} from '../../utils/types'
import {IActionWithPayload} from '../../utils/helper'
import { utils } from 'ethers'

type Type =STAKING_TYPE.STAKING_DATA_LOAD_START | STAKING_TYPE.STAKING_DATA_LOAD_SUCCESS | STAKING_TYPE.STAKING_DATA_LOAD_FAIL
type AccountType = IActionWithPayload<Type, utils.Result>

const initialState = {
    stakingData: [],
    loading: false,
    isLoaded: false,
    isError: false
}

export const stakingDataReducer = (state=initialState, action:AccountType)=>{

    switch (action.type) {
        case STAKING_TYPE.STAKING_DATA_LOAD_START:
            
            return{
                ...state,
                loading:true,
                isLoaded: false,
                isError: false
            }
        case STAKING_TYPE.STAKING_DATA_LOAD_SUCCESS:
        
            return{
                ...state,
                stakingData: action.payload,
                isLoaded: true,
                loading: false,
                isError: false
            }

        case STAKING_TYPE.STAKING_DATA_LOAD_FAIL:
        
            return{
                ...state,
                isLoaded: false,
                loading: false,
                isError: true
            }

        default:
            return state
    }
}