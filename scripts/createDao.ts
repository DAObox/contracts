import '@nomiclabs/hardhat-ethers'
import hre from 'hardhat'
import { Address, Deployment, Receipt } from 'hardhat-deploy/types'
import { DBRegistry } from '../typechain-types/contracts/DBRegistry'
import { writeDaoToFile } from './helpers'

// DAO Names (aragonId) must be unique
const daoName = 'test-dao-' + Math.random().toString(36).substring(7)
// Description of DAO
const description = 'some imaginative description'

async function main() {
    const deployer = (await hre.ethers.getSigners())[0]
    const cid: string = await hre.run('dao-data', { name: daoName, description })

    // deploying NFT
    const NFT = await hre.ethers.getContractFactory('MockFollow')
    const nft = await (await NFT.deploy()).deployed()
    await nft.initialize('0x01')
    const nftAddress: Address = nft.address
    console.log('NFT deployed to:', nftAddress)

    // delegating to self
    await nft.delegate(deployer.address)
    console.log('delegated to self')

    const Reg: Deployment = await hre.deployments.get('DBRegistry')
    console.log(`https://dashboard.tenderly.co/0xCon/daobox/contract/mumbai/${Reg.address}`)
    const registry: DBRegistry = await hre.ethers.getContractAt('DBRegistry', Reg.address, deployer)
    await registry.deployed()

    // creating dao
    const receipt: Receipt = await (await registry.newDefaultDAO(nftAddress, daoName, cid)).wait()
    const dao = writeDaoToFile({ token: nftAddress }, receipt)

    // log dao
    console.table(dao)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
