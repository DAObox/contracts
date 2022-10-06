pragma solidity 0.4.24;

import {DBVoting} from './apps/DBVoting.sol';
import {VotesForwarder} from './apps/VotesForwarder.sol';
import {IVotingToken} from './interfaces/IVotingToken.sol';
import {Agent} from '@aragon/apps-agent/contracts/Agent.sol';
import {ACL} from '@aragon/os/contracts/acl/ACL.sol';
import {Kernel} from '@aragon/os/contracts/kernel/Kernel.sol';
import {DBTemplate} from './DBTemplate.sol';

contract DBRegistry {
    /* ====================================================================== //
                                        STATE
    // ====================================================================== */

    struct DAO {
        string aragonId;
        Kernel kernel;
        ACL acl;
        Agent agent;
        DBVoting voting;
        VotesForwarder forwarder;
        IVotingToken token;
        string metadata;
    }
    uint256 public daoId;
    mapping(uint256 => DAO) internal daosById;
    mapping(string => uint256) internal daosByName;
    DBTemplate public template;

    /* ====================================================================== //
                                        EVENTS
    // ====================================================================== */

    event DAORegistered(
        Kernel dao,
        ACL acl,
        Agent agent,
        DBVoting voting,
        VotesForwarder votesForwarder,
        uint256 daoId,
        string aragonId,
        string metadata
    );

    /* ====================================================================== //
                                    DEPLOY FUNCTIONS
    // ====================================================================== */

    constructor(DBTemplate _template) public {
        template = _template;
    }

    function newDefaultDAO(
        address _token,
        string _id,
        string _metadata
    ) external {
        uint64 votingSupport = 50 * 10**16;
        uint64 votingMinQuorum = 5 * 10**16;
        uint64 votingTime = 3 days;
        newDAO(_token, _id, [votingSupport, votingMinQuorum, votingTime], _metadata);
    }

    function newDAO(
        address _token,
        string memory _id,
        uint64[3] memory _votingSettings,
        string memory _metadata
    )
        public
        returns (
            Kernel dao,
            ACL acl,
            Agent agent,
            DBVoting voting,
            VotesForwarder forwarder
        )
    {
        (dao, acl, agent, voting, forwarder) = template.newDAO(_token, _id, _votingSettings);
        uint256 id = ++daoId; // start at 1
        daosById[id] = DAO({
            aragonId: _id,
            kernel: dao,
            acl: acl,
            agent: agent,
            voting: voting,
            forwarder: forwarder,
            token: IVotingToken(_token),
            metadata: _metadata
        });
        daosByName[_id] = id;
        emit DAORegistered(dao, acl, agent, voting, forwarder, id, _id, _metadata);
    }

    /* ====================================================================== //
                                VIEW FUNCTIONS
    // ====================================================================== */

    function getDAOById(uint256 id)
        external
        view
        returns (
            string aragonId,
            Kernel kernel,
            ACL acl,
            Agent agent,
            DBVoting voting,
            VotesForwarder forwarder,
            IVotingToken token,
            string metadata
        )
    {
        DAO storage dao_ = daosById[id];
        aragonId = dao_.aragonId;
        kernel = dao_.kernel;
        acl = dao_.acl;
        agent = dao_.agent;
        voting = dao_.voting;
        forwarder = dao_.forwarder;
        token = dao_.token;
        metadata = dao_.metadata;
    }

    function getDAOByName(string name)
        external
        view
        returns (
            uint256 id,
            Kernel kernel,
            ACL acl,
            Agent agent,
            DBVoting voting,
            VotesForwarder forwarder,
            IVotingToken token,
            string metadata
        )
    {
        id = daosByName[name];
        DAO storage dao_ = daosById[id];
        kernel = dao_.kernel;
        acl = dao_.acl;
        agent = dao_.agent;
        voting = dao_.voting;
        forwarder = dao_.forwarder;
        token = dao_.token;
        metadata = dao_.metadata;
    }

    /* ====================================================================== //
                                        UPDATE FUNCTIONS
    // ====================================================================== */

    function updateMetadata(uint256 id, string metadata) external {
        require(daosById[id].kernel != address(0), 'DAO DOES NOT EXIST');
        require(daosById[id].agent == msg.sender, 'ONLY DAO AGENT CAN UPDATE METADATA');
        DAO storage dao_ = daosById[id];
        dao_.metadata = metadata;
    }
}
