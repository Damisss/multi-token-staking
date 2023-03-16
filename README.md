# Multi Token Staking 
The code in this project provides a full-stack staking DApp. Users can stack/lock allowed assets (ERC20 token) in to protocol. They can unlock their tokens and pull out the token from smart contract at any time. The protocol emit a fix amount of rewards token per block and disperse them to token stakers(users).
We have used Automated market makers system (e.g. uniSwap) to convert price between tokens. One could use Oracle based approach (e.g. chainlink) for price conversion between tokens. The contract is accessed via a universal upgradeable proxy standard smart contract.

| :exclamation:  ** WARNING None of the contracts are audited!  |
|-----------------------------------------|

# Online demo
- add goerli testnet into your metamask wallet
- get some goerli ether here https://goerlifaucet.com/
- open [staking app](https://bitter-paper-9940.on.fleek.co/) to view the staking app in the browser
- select the asset you wanna stake then click on faucet in order to get some tokens.

# Configure .env file:
Create a .env file, and fill in the following values (refer to the .env.example file):
- ALCHEMY_API_KEY="API_KEY_POLYGON_MAINNET"
- ALCHEMY_TESTNET_API_KEY="API_KEY_GOERLI"
- PRIVATE_KEY="YOUR_PRIVATE_KEY" 
- ETHERSCAN_API_KEY="API_KEY_ETHERSCAN"
- COINMARKETCAP="API_KEY_COIN_MARKET_CAP"

# Run a demo locally

1. Clone the repo into a directory
- cd into the directory
- execute commands:
```console
cd client
npm install
cd smart-contract 
npm install
```

2. Deployment  and run the (client app) front-end
- cd into smart-contract
- execute command:
```console
npm run hardhat:fork
```
- open a new terminal
- cd smart-contract
- execute commands:
```console
npm run deploy:localhost
npm run addtoken
```
- copy address from smart-contract/contracts-build-directory/staking-contract/address.json then past it into client/src/contracts-build-directory/contracts-build-directory/staking-contract/address.json
- open a new terminal
- cd into client
- execute command:
```console
npm start
```
- open [http://localhost:3000](http://localhost:3000) to view it in the browser.
  
## Run a demo on docker

1. Clone the repo into a directory
- cd in to the directory
- execute command:
```console
docker-compose build localhost
```

2. Deployment  and run the (client app) front-end
- cd into project directory
- execute command:
```console
docker-compose up localhost
```
- copy address from smart-contract/contracts-build-directory/staking-contract/address.json then past it in client/src/contracts-build-directory/contracts-build-directory/staking-contract/address.json
- open a new terminal 
- cd into the project directory
- execute commands:
```console
docker-compose build client
docker-compose up client
```
- open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# Run tests
- cd into smart-contract
- execute command:
```console
npm run hardhat:fork
```
- open a new terminal 
- cd smart-contract
- execute command:
```console
npm run hardhat:test
```
# Run tests on docker
- cd into the project directory
- execute commands:
```console
docker-compose build test
docker-compose up test
```
# Deploy contract into goerli testnet
- cd into the project directory
- execute commands:
```console
docker-compose build deploy-goerli
docker-compose up deploy-goerli
```
Note: few steps are required in order to run the frontend using deployed smart contract in goerli testnet. first cd to smart-contract directory. After that you should verify the implementation contract by executing this command **npx hardhat verify --network goerli address** and then add the allowed tokens into the protocol by running **npx hardhat run scripts/addToken.ts --network goerli**. Copy address from smart-contract/contracts-build-directory/staking-contract/address.json then past it into client/src/contracts-build-directory/staking-contract/address.json.

|Contract Name|Adress|
|-------------|-------------|
|Proxy|0x2180752c6792E3Ca792457eb5b6BFe2fD42E5670|
|Implementation|0xeb136d1d3d9142a6bea010ab31c4d2c7be78e8a2|
|Rewards Token|0xb4482C7675b8C33406c811f9D5bD1C378730bC36|

# References
https://github.com/smartcontractkit/defi-minimal
https://solidity-by-example.org/defi/staking-rewards/
https://ineuron.ai/course/Full-Stack-Blockchain-Development 
