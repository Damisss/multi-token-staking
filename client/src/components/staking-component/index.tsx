import { FunctionComponent } from 'react'
import { AssetComponent } from '../asset-component'

type Staking = {
    tokenAddress:string
    tokenSymbol:string
    onClick?: ()=>void
}

export const Staking:FunctionComponent<Staking> = ({
    onClick,
    tokenAddress,
    tokenSymbol
})=>{
    return(
        <div onClick={onClick}>
            <div className='border-solid border-t-2 mb-2'></div>
            <div className='px-2'>
                <AssetComponent
                    tokenAddress={tokenAddress}
                    tokenSymbol={tokenSymbol}
                />
            </div>
            <div className='border-solid border-t-2 mt-2'></div>
        </div>
    )
}