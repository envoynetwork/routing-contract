# OpenSea routing contract

## Contracts

This repository contains a smart contract that will collect Ether coming from OpenSea and distribute it over the amount of shareholders who should receive the funds. The owner of the contract, Envoy, is responisble for adding, updating or deleting new shareholders and for periodically triggering the pay out of shareholders. This will emit an event, so shareholders can automatically subscribe to pay out events.
The contract owner is able to withdrawl all funds at a point in time as a safety measure.

## Website

A simple front end to test the features in the smart contract. Before testing, make sure you set `Website/settings.js` correct.

### Running local on Ganache

1) Deploy the contract on your local blockchain via Truffle
2) Insert the contract address in `Website/settings.js`
3) Use "http://127.0.0.1:8545" as `webProvider` in `Website/settings.js`

### Running on a network

1) Lookup the network address below; or deploy via Truffle and list the info below.
2) Insert the contract address in `Website/settings.js`
3) Use "https://{testnet}.infura.io/v3/{infurakey}" as `webProvider` in `Website/settings.js`. Here, testnet is the name of the testnet, infurakey is the infurakey for this project.

## Deployment information

Rinkeby deployment address:

- owner: 0x6b4934c85B8cb94A6a7aC4496a2eEc9184fFac59
- contract address: 0xD4955E7041C150177Dc6d72549e70D75b008E8Ce
- transaction address: 0x73f89daeb9cdc34324250e0c5138860b7218e22b49411c5d533268293632c4a1
