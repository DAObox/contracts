<div align="center">
    <h1>DAO Box</h1>
    <strong>Meta Transaction enabled DAO platfrom powered by Lens Protocol, Biconomy, and Aragon</strong>
</div>
<br>

<div align="center">
    <br>
    <a href="https://daobox.app"><b>DAOBox.app »</b></a>
    <br><br>
    <a href="https://discord.gg/F6qgHwZahQ"><b>Discord</b></a>
    •
    <a href="https://github.com/DAObox/contracts/issues"><b>Issues</b></a>
</div>


<br/>

## 🗳️ About Dao Box

Meta Transaction enabled DAO platform powered by [Lens Protocol](http://lens.xyz), [Biconomy](https://biconomy.io), and [Aragon](https://aragon.org/). DAO Box leverages the Vote Delegation feature built into Lens protocol NFTs, and enables communities to spin up a DAO governed by a follow NFT.

DAOs come equipped with a treasury contract that can interact with any other on polygon as well as onchain gas-less voting. Discussions are also baked into the platform and powered by lens. With DAO Box you no longer need snapshot or a Discourse forum, you get everything you need out the box!

<br/>

## ⚙️ Setup

### Using Local Environment

```sh
cp .env.example .env
pnpm install
```

<br/>

### 🔧 Tenderly (Optional)

we use tenderly for debugging and monitoring. Its optional but highly recommended. you can create a [free account here](https://tenderly.co/)

install on mac with

```
brew tap tenderly/tenderly
brew install tenderly
```

login

```
tenderly login
```

initialize the project

```
tenderly init
```

<br/>

### 👷🏾 Deploying Contracts

Deployment will only work on Mumbai or a fork network. We rely on some factory contracts from Aragon Classic which are deployed there.

first modify the `.env.example` and save it as `.env`

then deploy with

```
npx deploy --network mumbai
```

<br/>

## ✅ Community

For a place to have open discussions on features, voice your ideas, or get help with general questions please visit our community at [Discord](https://discord.gg/F6qgHwZahQ).

<br/>

## ⚖️ License

DAO Box is open-sourced software licensed under the © [MIT](LICENSE).
