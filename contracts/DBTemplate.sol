pragma solidity 0.4.24;

import {DBVoting} from './apps/DBVoting.sol';
import {VotesForwarder} from './apps/VotesForwarder.sol';
import {IVotingToken} from './interfaces/IVotingToken.sol';
import '@aragon/apps-agent/contracts/Agent.sol';
import '@aragon/os/contracts/acl/ACL.sol';
import '@aragon/os/contracts/apm/Repo.sol';
import '@aragon/os/contracts/apm/APMNamehash.sol';
import '@aragon/os/contracts/kernel/Kernel.sol';
import '@aragon/os/contracts/lib/ens/ENS.sol';
import '@aragon/os/contracts/lib/ens/PublicResolver.sol';
import '@aragon/os/contracts/factory/DAOFactory.sol';
import '@aragon/os/contracts/common/IsContract.sol';
import '@aragon/id/contracts/IFIFSResolvingRegistrar.sol';

contract DBTemplate is APMNamehash, IsContract {
    /* ====================================================================== //
                                        APP IDS
    // ====================================================================== */

    // keccak256(abi.encodePacked(apmNamehash('open'), keccak256('db-voting')));
    // keccak256(abi.encodePacked(apmNamehash('open'), keccak256('votes-forwarder')));
    // apmNamehash('agent');
    bytes32 internal VOTING_APP_ID = 0x83db27ec048876d414097dca45d6d5aebef29349eb9e8634f31d32595f530779;
    bytes32 internal VOTES_FORWARDER_APP_ID = 0xbb8e3a480e6426147fffada9d3aae63d7757e5fea58ece97b535c7b021badc94;
    bytes32 internal AGENT_APP_ID = 0x9ac98dc5f995bf0211ed589ef022719d1487e5cb2bab505676f0d084c07cf89a;

    /* ====================================================================== //
                                        STORAGE
    // ====================================================================== */

    ENS internal ens;
    DAOFactory internal daoFactory;
    IFIFSResolvingRegistrar internal aragonID;
    DBVoting public votingBase;
    VotesForwarder public votesForwarderBase;
    Agent public agentBase;

    /* ====================================================================== //
                                        EVENTS
    // ====================================================================== */

    event SetupDao(address dao);
    event InstalledApp(address appProxy, bytes32 appId);
    event CompleteDAO(Kernel dao, ACL acl, Agent agent, DBVoting voting, VotesForwarder votesForwarder);

    /* ====================================================================== //
                                    EXTERNAL FUNCTIONS
    // ====================================================================== */

    constructor(
        DBVoting _votingBase,
        VotesForwarder _votesForwarderBase,
        Agent _agentBase,
        DAOFactory _daoFactory,
        ENS _ens,
        IFIFSResolvingRegistrar _aragonID
    ) public {
        ens = _ens;
        aragonID = _aragonID;
        daoFactory = _daoFactory;
        votingBase = _votingBase;
        votesForwarderBase = _votesForwarderBase;
        agentBase = _agentBase;
    }

    function newDAO(
        address _token,
        string memory _id,
        uint64[3] memory _votingSettings
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
        // Create & Setup DAO
        dao = daoFactory.newDAO(this);
        acl = ACL(dao.acl());
        acl.createPermission(address(this), dao, dao.APP_MANAGER_ROLE(), address(this));

        // install Apps
        agent = _installAgentApp(dao);
        voting = _installDaoBoxVoting(dao, _token, _votingSettings);
        forwarder = VotesForwarder(_installVotesForwarder(dao, _token));

        // voting permissions
        acl.createPermission(voting, voting, voting.MODIFY_QUORUM_ROLE(), voting);
        acl.createPermission(voting, voting, voting.MODIFY_SUPPORT_ROLE(), voting);
        acl.createPermission(forwarder, voting, voting.CREATE_VOTES_ROLE(), voting);

        // agent permissions
        acl.createPermission(voting, agent, agent.EXECUTE_ROLE(), voting);
        acl.createPermission(voting, agent, agent.RUN_SCRIPT_ROLE(), voting);

        // votesForwarder permissions <-- HACK used to setup votesForwarder
        acl.createPermission(address(0), forwarder, forwarder.FANTOM_ROLE(), address(0));

        // finalise DAO
        _transferRootPermissionsFromTemplateAndFinalizeDAO(dao, voting, voting);
        _registerID(_id, dao);

        emit CompleteDAO(dao, acl, agent, voting, forwarder);
    }

    /* ====================================================================== //
                                INTERNAL FUNCTIONS
    // ====================================================================== */
    function _installAgentApp(Kernel _dao) internal returns (Agent) {
        bytes memory initializeData = abi.encodeWithSelector(Agent(0).initialize.selector);
        Agent agent = Agent(_dao.newAppInstance(AGENT_APP_ID, agentBase, initializeData, true));
        _dao.setRecoveryVaultAppId(AGENT_APP_ID);
        return agent;
    }

    function _installDaoBoxVoting(
        Kernel dao,
        address token,
        uint64[3] memory _votingSettings
    ) internal returns (DBVoting) {
        DBVoting voting = DBVoting(dao.newAppInstance(VOTING_APP_ID, votingBase));
        voting.initialize(IVotingToken(token), _votingSettings[0], _votingSettings[1], _votingSettings[2]);
        emit InstalledApp(address(voting), VOTING_APP_ID);
        return voting;
    }

    function _installVotesForwarder(Kernel _dao, address token) internal returns (address) {
        VotesForwarder forwarder = VotesForwarder(_dao.newAppInstance(VOTES_FORWARDER_APP_ID, votesForwarderBase));
        forwarder.initialize(token);
        emit InstalledApp(address(forwarder), VOTES_FORWARDER_APP_ID);
        return forwarder;
    }

    function _transferRootPermissionsFromTemplateAndFinalizeDAO(
        Kernel _dao,
        address _to,
        address _manager
    ) internal {
        ACL _acl = ACL(_dao.acl());
        _transferPermissionFromTemplate(_acl, _dao, _to, _dao.APP_MANAGER_ROLE(), _manager);
        _transferPermissionFromTemplate(_acl, _acl, _to, _acl.CREATE_PERMISSIONS_ROLE(), _manager);
        emit SetupDao(_dao);
    }

    function _transferPermissionFromTemplate(
        ACL _acl,
        address _app,
        address _to,
        bytes32 _permission,
        address _manager
    ) internal {
        _acl.grantPermission(_to, _app, _permission);
        _acl.revokePermission(address(this), _app, _permission);
        _acl.setPermissionManager(_manager, _app, _permission);
    }

    function _registerID(string memory _name, address _owner) internal {
        aragonID.register(keccak256(abi.encodePacked(_name)), _owner);
    }
}
