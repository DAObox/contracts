import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = (await hre.ethers.getSigners())[0]
    const { deploy } = hre.deployments
    await deploy('MockFollow', {
        from: deployer.address,
        log: true,
    })
    await deploy('Target', {
        from: deployer.address,
        log: true,
    })

    const targetAddress = (await hre.deployments.get('Target')).address
    const followAddress = (await hre.deployments.get('MockFollow')).address

    await hre.tenderly.verify(
        {
            name: 'MockFollow',
            address: followAddress,
        },
        {
            name: 'Target',
            address: targetAddress,
        }
    )
}
module.exports.tags = ['Mocks']
export default func
