import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import settings from '../template_config'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = (await hre.ethers.getSigners())[0]

    let DAO_FACTORY: string, ENS: string, FIFS: string
    if (hre.network.name === 'mumbai') {
        DAO_FACTORY = settings.mumbai.DAO_FACTORY
        ENS = settings.mumbai.ENS
        FIFS = settings.mumbai.FIFS
    } else {
        DAO_FACTORY = settings.polygon.DAO_FACTORY
        ENS = settings.polygon.ENS
        FIFS = settings.polygon.FIFS
    }

    const agent = (await hre.deployments.get('Agent')).address
    const voting = (await hre.deployments.get('DBVoting')).address
    const forwarder = (await hre.deployments.get('VotesForwarder')).address

    const { deploy } = hre.deployments
    await deploy('DBTemplate', {
        from: deployer.address,
        args: [voting, forwarder, agent, DAO_FACTORY, ENS, FIFS],
        log: true,
    })

    // get agent address
    const address = (await hre.deployments.get('DBTemplate')).address
    await hre.tenderly.verify({
        name: 'DBTemplate',
        address,
    })
}
module.exports.tags = ['DBTemplate']
export default func
