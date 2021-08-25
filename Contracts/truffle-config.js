/**
 * Envoy Billboard SC deployment config
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
const infuraKey = fs.readFileSync(".infuraKey").toString().trim();

module.exports = {

  // Ethereum networks
  networks: {

    // Development
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },

    // Testnet
    goerli: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://goerli.infura.io/v3/" + infuraKey)
      },
      network_id: 5,
      gas: 4000000
    },

    // Testnet
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + infuraKey)
      },
      network_id: 4
    }

    // Mainnet
    // TODO

  },

  // Default mocha options
  mocha: {
    // timeout: 100000
  },

  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.0",
    }
  },

  // Truffle DB is not needed
  db: {
    enabled: false
  }
};
