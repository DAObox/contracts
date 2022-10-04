import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = (await hre.ethers.getSigners())[0]
    const { deploy } = hre.deployments
    await deploy('VotesForwarder', {
        from: deployer.address,
        log: true,
    })

    // get agent address
    const address = (await hre.deployments.get('VotesForwarder')).address
    await hre.tenderly.verify({
        name: 'VotesForwarder',
        address,
    })
}
module.exports.tags = ['VotesForwarder']
export default func
