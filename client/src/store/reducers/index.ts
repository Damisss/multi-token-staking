import {combineReducers} from 'redux'
import {accountReducer} from '../reducers/account-reducer'
import { alertReducer } from './alert-reducer'
import { balancesReducer } from './balance-reducer'
import { contractReducer } from './contract-reducer'
import { networkReducer } from './network-reducer'
import { stakingDataReducer } from './staking-data-reducer'
import { withdrawReducer } from './withdraw-reducer'
import {stakeReducer} from './stake-reducer'
import {claimRewardReducer} from './claim-reward-reducer'

export const rootReducer = combineReducers({
    account: accountReducer,
    network: networkReducer,
    contract: contractReducer,
    alert: alertReducer,
    withdraw: withdrawReducer,
    stake:stakeReducer,
    claimRewards: claimRewardReducer,
    stakingData: stakingDataReducer,
    balances:balancesReducer
})