import { Receipt } from 'hardhat-deploy/types'
import fs from 'fs'
import { BigNumber } from 'ethers'

export function getTenderlyTransaction(network: string, hash: string) {
    return `https://dashboard.tenderly.co/tx/${network}/${hash}`
}

export function writeDaoToFile(token: { token: string }, receipt: Receipt) {
    let data = token
    const res = receipt.events?.filter((x) => x.event == 'DAORegistered')[0]?.args

    for (let [key, value] of Object.entries(res)) {
        isNaN(key) && (data[key] = BigNumber.isBigNumber(value) ? value.toString() : value)
    }

    fs.writeFile('./settings/dao.json', JSON.stringify(data, null, 2), function (err: any) {
        if (err) return console.log(err)
        console.log('written to ./settings/dao.json')
    })

    return data
}
