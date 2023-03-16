import { utils } from 'ethers'
import { actionCreator } from '../../utils/helper'
import {STAKING_TYPE} from '../../utils/types'

export const stakingDataLoadStart = actionCreator(STAKING_TYPE.STAKING_DATA_LOAD_START, '')
export const stakingDataLoadSuccess = (data:(utils.Result | undefined )[])=>actionCreator(STAKING_TYPE.STAKING_DATA_LOAD_SUCCESS, data)
export const stakingDataLoadFail = actionCreator(STAKING_TYPE.STAKING_DATA_LOAD_FAIL, '')