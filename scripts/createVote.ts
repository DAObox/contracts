import '@nomiclabs/hardhat-ethers'
import hre from 'hardhat'
import { createVoteScript, getTenderlyTransaction, loadDaoFromFile } from './helpers'

const transactionSettings = {
    to: '0x0bDe1f286E7cba9A7382931e0A38fe674aE7d68D',
    signature: 'increment()',
    args: [],
}

async function main() {
    const dao = loadDaoFromFile()
    const metadata = 'some test vote'
    const forwarder = await hre.ethers.getContractAt('VotesForwarder', dao.votesForwarder)
    const voteScript = createVoteScript(dao.voting, metadata, transactionSettings)
    const receipt = await (await forwarder.forward(voteScript)).wait()
    console.log(`vote created: ${getTenderlyTransaction(hre.network.name, receipt.transactionHash)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
