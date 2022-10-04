import * as dotenv from 'dotenv'
dotenv.config()
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-network-helpers'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'
import * as tdly from '@tenderly/hardhat-tenderly'
tdly.setup({ automaticVerifications: false })

import './tasks'

const ENV = process.env

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.4.24',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 20000,
                    },
                },
            },
            {
                version: '0.8.10',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 20000,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            forking: {
                url: ENV.MUMBAI_RPC_URL as string,
            },
        },
        localhost: {
            url: 'http://localhost:8545',
        },
        mumbai: {
            url: ENV.MUMBAI_RPC_URL,
            accounts: [ENV.PRIVATE_KEY as string],
        },
        polygon: {
            url: ENV.POLYGON_RPC_URL,
            accounts: [ENV.PRIVATE_KEY as string],
        },
        frame: {
            httpHeaders: { origin: 'hardhat' },
            url: 'http://localhost:1248',
        },
    },
    tenderly: {
        project: 'daobox',
        username: '0xcon',
    },
    etherscan: {
        apiKey: {
            polygon: ENV.POLYGONSCAN_KEY as string,
            polygonMumbai: ENV.POLYGONSCAN_KEY as string,
        },
    },
}

export default config
