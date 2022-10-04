import { ethers } from 'hardhat'
import { utils } from 'ethers'
import { Address } from 'hardhat-deploy/types'
import { FunctionFragment, Interface } from 'ethers/lib/utils'
import { CallScriptAction, TxSettings } from '../../types'

export function createCallScript({ to, signature, args }: TxSettings) {
    let targetInterface: Interface = new ethers.utils.Interface([`function ${signature}`])
    const fragment: FunctionFragment = Object.values(targetInterface.functions)[0]
    const data: string = targetInterface.encodeFunctionData(fragment, args)
    return encodeCallScript([{ to, data }])
}

export function encodeCallScript(actions: CallScriptAction[]): string {
    const CALLSCRIPT_ID = '0x00000001'
    return actions.reduce((script: string, { to, data }: any) => {
        const address = utils.defaultAbiCoder.encode(['address'], [to])
        const dataLength = utils.defaultAbiCoder.encode(['uint256'], [(data.length - 2) / 2])

        return script + address.slice(26) + dataLength.slice(58) + data.slice(2)
    }, CALLSCRIPT_ID)
}

export function createVoteScript(votingAddress: Address, metadata: string, txSettings: TxSettings) {
    const targetScript = createCallScript(txSettings)
    const voteScript = createCallScript({
        to: votingAddress,
        signature: 'newVote(bytes,string,bool,bool)',
        args: [targetScript, metadata, false, false],
    })
    return voteScript
}

export function encodeActCall(signature: string, params: any[] = []): string {
    const sigBytes = utils.hexDataSlice(utils.id(signature), 0, 4)
    const types = signature.replace(')', '').split('(')[1]

    // No params, return signature directly
    if (types === '') {
        return sigBytes
    }

    const paramBytes = new utils.AbiCoder().encode(types.split(','), params)

    return `${sigBytes}${paramBytes.slice(2)}`
}
