import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = (await hre.ethers.getSigners())[0]
    const { deploy } = hre.deployments
    await deploy('Agent', {
        from: deployer.address,
        log: true,
    })

    // get agent address
    const agentAddress = (await hre.deployments.get('Agent')).address
    await hre.tenderly.verify({
        name: 'Agent',
        address: agentAddress,
    })
}
module.exports.tags = ['Agent']
export default func
