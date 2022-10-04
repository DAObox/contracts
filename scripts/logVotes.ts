import '@nomiclabs/hardhat-ethers'
import hre from 'hardhat'
import { loadDaoFromFile, objectifyLog } from './helpers'

async function main() {
    const dao = loadDaoFromFile()
    const voting = await hre.ethers.getContractAt('DBVoting', dao.voting)
    let votes = (await voting.votesLength()) - 1 // returns one higher than the last vote
    console.log(` ======================================== Votes ${votes + 1} ========================================`)
    while (votes >= 0) console.table(objectifyLog(await voting.getVote(votes--)))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
