import { Receipt } from 'hardhat-deploy/types'
import fs from 'fs'
import { BigNumber } from 'ethers'

export function getTenderlyTransaction(network: string, hash: string) {
    return `https://dashboard.tenderly.co/tx/${network}/${hash}`
}

export function writeDaoToFile(token: { token: string }, receipt: Receipt) {
    const res = receipt.events?.filter((x) => x.event == 'DAORegistered')[0]?.args

    const data = { ...token, ...objectifyLog(res) }

    fs.writeFile('./settings/dao.json', JSON.stringify(data, null, 2), function (err: any) {
        if (err) return console.log(err)
        console.log('written to ./settings/dao.json')
    })

    return data
}

export function loadDaoFromFile() {
    try {
        return JSON.parse(fs.readFileSync('./settings/dao.json', 'utf8'))
    } catch (err) {
        console.log('no dao.json found')
        process.exitCode = 1
    }
}

export function objectifyLog(log: any) {
    const data = {}
    for (let [key, value] of Object.entries(log)) {
        isNaN(key) && (data[key] = BigNumber.isBigNumber(value) ? value.toString() : value)
    }
    return data
}
