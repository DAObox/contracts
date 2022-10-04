// SPDX-License-Identifier: MIT
pragma solidity 0.4.24;

interface IVotes {
    function getVotes(address account) external view returns (uint256);

    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);

    function getPastTotalSupply(uint256 blockNumber) external view returns (uint256);
}
