import { useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux'


import {NavBar} from './components'
import { AlertComponent } from './components/alert'
import { ProcessingComponent } from './components/processing'
import { StakingContainer } from './containers/staking-container';
import {
  loadAccountFail,
  loadAccountStart,
  loadAccountSuccess,
  loadNetworkIdStart,
  loadNetworkIdSuccess,
  loadContractStart,
  loadContractSuccess,
  withdrawSuccess
} from './store/actions'

import { stakingDataLoadFail, stakingDataLoadSuccess } from './store/actions/staking-data-actions';
import { stakeSuccess } from './store/actions/stake-actions'
import { stakingDataSelector } from './store/utils/custom-selector';
import { 
  fetchEventData,
  getAccount, 
  getChainId, 
  loadArtifacts, 
  loadContract, 
  provider, 
  removeMetamaskEvents, 
  subscribeToEvent, 
  subscribMetamaskEvents 
} from './utils/helper'
import {State} from './utils/types'
import { claimRewardSuccess } from './store/actions/claim-reward-actions';

function App() {
  //const {stakingData} = useSelector(stakingDataSelector)
  const state = useSelector((state:State)=>state)
  const dispatch = useDispatch()
 
  const metamaskEventHandler = (...args:unknown[])=>{
    const currentAccount = args[0] as string[]
    dispatch(loadAccountSuccess(currentAccount[0]))
  }

  useEffect(()=>{
    
    const fetchData = async()=>{
    try {
      dispatch(loadNetworkIdStart)
      dispatch(loadContractStart)
      const chainId = await getChainId(provider)
      if(Number(chainId.toString())){
        
        dispatch(loadNetworkIdSuccess(Number(chainId.toString())))

        dispatch(loadAccountStart)
        const account = await getAccount(provider)
        if (account){
          dispatch(loadAccountSuccess(account))
          
        } 

        const {
          stakingContractABI,
          stakingContractAddress
        } = loadArtifacts()
        
        const staking = loadContract(stakingContractAddress, stakingContractABI, provider)
        dispatch(loadContractSuccess(staking))
        dispatch(stakingDataLoadFail)
        await fetchEventData(staking, 'AddToken', dispatch, stakingDataLoadSuccess, provider)

        if(state.stake.submitting){
          subscribeToEvent(staking, 'Stake', dispatch, stakeSuccess)
        }

        if(state.claimRewards.submitting){
          subscribeToEvent(staking, 'ClaimRewards', dispatch, claimRewardSuccess)
        }

        if(state.withdraw.submitting){
          subscribeToEvent(staking, 'Withdraw', dispatch, withdrawSuccess)
        }
 
        
      }
         
    } catch (error) {
      if(!state.account.account.length){
        dispatch(loadAccountFail) 
      }
      //no matching event
      dispatch(stakingDataLoadFail)
      

      console.log(error)
    }
    
    }
    
    fetchData()
    subscribMetamaskEvents(metamaskEventHandler)
    
  return ()=>{
    removeMetamaskEvents(metamaskEventHandler)
  }
  },[
    state.network.chainId, 
    state.stake.submitting, 
    state.claimRewards.submitting,
    state.withdraw.submitting
  ])
  
  return (
    <div className="bg-[#f7f7f9] h-screen">
      <div>
        <NavBar chainId={state.network.chainId}/>
      </div>
      <div></div>
      <StakingContainer/>
      <ProcessingComponent 
        alertType={state.alert.isProcessing} 
        showProcessing={state.alert.isShown} 
        processingMessage={state.alert.message}
      />
      <AlertComponent 
        alertType={state.alert.isAlert} 
        showAlert={state.alert.isShown} 
        alertMessage={state.alert.message}
        isSuccess={state.alert.isSuccess}
      />
    </div>
  );
}

export default App;
