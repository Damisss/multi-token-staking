import { actionCreator } from '../../utils/helper'
import {STAKE_TYPE} from '../../utils/types'

export const stakeStart = actionCreator(STAKE_TYPE.STAKE_START, '')
export const stakeSuccess = actionCreator(STAKE_TYPE.STAKE_SUCCESS, '')
export const stakeFail = actionCreator(STAKE_TYPE.STAKE_FAIL, '')