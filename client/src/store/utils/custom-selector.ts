import {createSelector} from 'reselect'
import {get} from 'lodash'
import { State } from '../../utils/types'


const stakingRowData = (state:State)=>get(state, 'stakingData.stakingData', [])

export const stakingDataSelector = createSelector(stakingRowData, (eventsArray)=>{

    const data:{token:string, priceFeed:string, isTokenAllowed: boolean}[] = []
    
    eventsArray.forEach(async(item:{token:string, priceFeed:string, isAllowed: boolean})=>{
        const dataIndex = data.findIndex((d)=>d.token == item.token)
    
        if(dataIndex >= 0){
            if(data[dataIndex].token === item.token && data[dataIndex].isTokenAllowed){
                data[dataIndex] = {
                    token: item.token,
                    priceFeed: item.priceFeed,
                    isTokenAllowed: item.isAllowed
                    
                }

            }
        }else{
            data.push({
                    token: item.token,
                    priceFeed: item.priceFeed,
                    isTokenAllowed: item.isAllowed
                }
            )
        }
        
    })
    
    return {
        stakingData: data
    }
})