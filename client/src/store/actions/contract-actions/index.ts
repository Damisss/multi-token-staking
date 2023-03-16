import { Contract } from 'ethers'
import { actionCreator } from '../../utils/helper'
import {CONTRACT_TYPE} from '../../utils/types'

export const loadContractStart = actionCreator(CONTRACT_TYPE.LOAD_CONTRACT_START, '')
export const loadContractSuccess = (staking:Contract)=>actionCreator(CONTRACT_TYPE.LOAD_CONTRACT_SUCCESS, staking)
export const loadContractFail = actionCreator(CONTRACT_TYPE.LOAD_CONTRACT_FAIL, '')