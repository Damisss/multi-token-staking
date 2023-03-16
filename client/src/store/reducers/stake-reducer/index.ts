import {STAKE_TYPE} from '../../utils/types'
import {IActionWithoutPayload} from '../../utils/helper'

type Type =STAKE_TYPE.STAKE_START | STAKE_TYPE.STAKE_SUCCESS | STAKE_TYPE.STAKE_FAIL
type StakeType = IActionWithoutPayload<Type>

const initialState = {
    submitting: false,
    submitted: false,
    isError: false
}

export const stakeReducer = (state=initialState, action:StakeType)=>{

    switch (action.type) {
        case STAKE_TYPE.STAKE_START:
            
            return{
                ...state,
                submitting:true,
                submitted: false,
                isError: false
            }
        case STAKE_TYPE.STAKE_SUCCESS:
        
            return{
                ...state,
                submitting:false,
                submitted: true,
                isError: false
            }

        case STAKE_TYPE.STAKE_FAIL:
        
            return{
                ...state,
                submitting:false,
                submitted: false,
                isError: true
            }

        default:
            return state
    }
}