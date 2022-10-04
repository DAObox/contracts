import '@nomiclabs/hardhat-ethers'
import { task } from 'hardhat/config'
import { Web3Storage, File, getFilesFromPath } from 'web3.storage'
import { resolve } from 'path'
import fs from 'fs'

export default task('dao-data', 'Publishes daos metadata to ipfs')
    .addParam('name', "The account's address")
    .addParam('description', "The account's address")
    .setAction(async ({ daoName, description }) => {
        const cid = await storeDaoData(daoName, description)
        console.log(`https://ipfs.io/ipfs/${cid}`)
        return cid
    })

async function storeDaoData(name: string, description: string) {
    const body = {
        name,
        description,
    }
    try {
        const files = await makeFileObjects(body)
        const cid = await storeFiles(files)
        return cid
    } catch (err) {
        console.log(err)
    }
}

async function makeFileObjects(body: { name: string; description: string }) {
    const buffer = Buffer.from(JSON.stringify(body))

    const imageDirectory = resolve(process.cwd(), getRandomOrb())
    const files = await getFilesFromPath(imageDirectory)

    files.push(new File([buffer], 'data.json'))
    return files
}

async function storeFiles(files: any) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    // console.log(cid)
    return cid
}

function makeStorageClient() {
    const token = process.env.WEB3_STORAGE_KEY
    if (!token) throw new Error('No token in .env found')
    return new Web3Storage({ token })
}

function getRandomOrb() {
    const dir = './public/images/orbs'
    const numFiles = fs.readdirSync(dir).length
    const randomNum = Math.floor(Math.random() * (numFiles - 1)) + 1
    return `./public/images/orbs/dao_orb_${randomNum}.png`
}
