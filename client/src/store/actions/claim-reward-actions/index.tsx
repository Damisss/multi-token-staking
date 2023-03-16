import { actionCreator } from '../../utils/helper'
import {CLAIM_REWARD_TYPE} from '../../utils/types'

export const claimRewardStart = actionCreator(CLAIM_REWARD_TYPE.CLAIM_REWARD_START, '')
export const claimRewardSuccess = actionCreator(CLAIM_REWARD_TYPE.CLAIM_REWARD_SUCCESS, '')
export const claimRewardFail = actionCreator(CLAIM_REWARD_TYPE.CLAIM_REWARD_FAIL, '')