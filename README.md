# OpenSea routing contract

## Contracts

This repository contains a smart contract that will collect Ether coming from OpenSea and distribute it over the amount of shareholders who should receive the funds. The owner of the contract, Envoy, is responisble for adding, updating or deleting new shareholders and for periodically triggering the pay out of shareholders. This will emit an event, so shareholders can automatically subscribe to pay out events.
The contract owner is able to withdrawl all funds at a point in time as a safety measure.

## Website

A simple front end to test the features in the smart contract.
