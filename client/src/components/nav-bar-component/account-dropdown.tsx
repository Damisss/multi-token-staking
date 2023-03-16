import { FunctionComponent } from 'react'

type AccountDropdown ={
    tokenDropdown: boolean
    accountDropdown: boolean
    account: string | null
    ethBalance: number
    totalEarnedBalance:{totalEarnedBalance:string}
}
export const AccountDropdown:FunctionComponent<AccountDropdown> = ({
    tokenDropdown,
    accountDropdown,
    account,
    ethBalance,
    totalEarnedBalance
})=>{

   
    const showtTokenDropdown = ()=>(
        <div className="absolute bg-blue-400 text-white p-4 md:w-full">
            <div className="flex flex-col">
                <span className="font-semibold text-center">Total Earned</span>
                <span className="text-center">
                    {  +totalEarnedBalance.totalEarnedBalance !== 0 ? 
                       totalEarnedBalance.totalEarnedBalance.slice(0, 20) : 
                       '0.00'
                    }
                </span>
            </div>
        </div>
    )
    const showAccountDropdown = ()=>(
        <div className="absolute bg-blue-400  text-white px-4">
            <span className="visible font-bold mt-2 ">Connected Wallet</span>
            <div className="mt-1 text-center">
                <span className="font-semibold">{account}</span>
            </div>
            <div className="border borderb-2 boder-white my-4"></div>
            <div className="flex flex-row justify-center">
                <div></div>
                <span className="mb-1 font-semibold">{ethBalance} ETH </span>
            </div>
        </div>
    )

    return(
        <div >
            {
              tokenDropdown &&  !accountDropdown && showtTokenDropdown() 
            }
            {
                !tokenDropdown &&  accountDropdown && showAccountDropdown()
            }
        </div>
    )
}