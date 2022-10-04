// SPDX-License-Identitifer: GPL-3.0-or-later

pragma solidity 0.4.24;

import '@aragon/os/contracts/apps/AragonApp.sol';
import '@aragon/os/contracts/common/IForwarder.sol';
import '@aragon/os/contracts/lib/math/SafeMath.sol';
import '../interfaces/IVotingToken.sol';

contract VotesForwarder is IForwarder, AragonApp {
    using SafeMath for uint256;

    bytes32 public constant FANTOM_ROLE = keccak256('FANTOM_ROLE');

    string private constant ERROR_CALLER_NOT_TOKEN = 'VF_CALLER_NOT_TOKEN';
    string private constant ERROR_CAN_NOT_FORWARD = 'VF_CAN_NOT_FORWARD';

    IVotingToken public token;

    modifier onlyToken() {
        require(msg.sender == address(token), ERROR_CALLER_NOT_TOKEN);
        _;
    }

    /**
     * @notice Initialize VotesForwarder for `_token.symbol(): string`
     * @param _token IVotingToken address for the managed token
     */
    function initialize(address _token) external onlyInit {
        initialized();
        token = IVotingToken(_token);
    }

    function isForwarder() external pure returns (bool) {
        return true;
    }

    /**
     * @notice Execute desired action as a token holder
     * @dev IForwarder interface conformance. Forwards any token holder action.
     * @param _evmScript Script being executed
     */
    function forward(bytes _evmScript) public {
        require(hasInitialized() && token.getPowerByBlockNumber(msg.sender, block.number) > 0, ERROR_CAN_NOT_FORWARD);
        bytes memory input = new bytes(0); // TODO: Consider input for this

        // Add the managed token to the blacklist to disallow a token holder from executing actions
        // on the token controller's (this contract) behalf
        address[] memory blacklist = new address[](1);
        blacklist[0] = address(token);

        runScript(_evmScript, input, blacklist);
    }

    function canForward(address _sender, bytes) public view returns (bool) {
        return hasInitialized() && token.getPowerByBlockNumber(_sender, block.number) > 0;
    }
}
