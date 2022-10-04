import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import settings from '../template_config'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const deployer = (await hre.ethers.getSigners())[0]
    const template = (await hre.deployments.get('DBTemplate')).address

    const { deploy } = hre.deployments
    await deploy('DBRegistry', {
        from: deployer.address,
        args: [template],
        log: true,
    })

    const address = (await hre.deployments.get('DBRegistry')).address
    await hre.tenderly.verify({
        name: 'DBRegistry',
        address,
    })
}
module.exports.tags = ['DBRegistry']
export default func
