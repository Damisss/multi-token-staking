import {CLAIM_REWARD_TYPE} from '../../utils/types'
import {IActionWithoutPayload} from '../../utils/helper'

type Type =CLAIM_REWARD_TYPE.CLAIM_REWARD_START | CLAIM_REWARD_TYPE.CLAIM_REWARD_SUCCESS | CLAIM_REWARD_TYPE.CLAIM_REWARD_FAIL
type ClaimRewardsType = IActionWithoutPayload<Type>

const initialState = {
    submitting: false,
    submitted: false,
    isError: false
}

export const claimRewardReducer = (state=initialState, action:ClaimRewardsType)=>{

    switch (action.type) {
        case CLAIM_REWARD_TYPE.CLAIM_REWARD_START:
            
            return{
                ...state,
                submitting:true,
                submitted: false,
                isError: false
            }
        case CLAIM_REWARD_TYPE.CLAIM_REWARD_SUCCESS:
        
            return{
                ...state,
                submitting:false,
                submitted: true,
                isError: false
            }

        case CLAIM_REWARD_TYPE.CLAIM_REWARD_FAIL:
        
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