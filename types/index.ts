import { Address } from 'hardhat-deploy/types'

export type TxSettings = {
    to: Address
    signature: string
    args: any[]
}

export type CallScriptAction = {
    to: string
    data: string
}
