require('dotenv').config();
var HDWalletProvider = require('@truffle/hdwallet-provider');

var Web3 = require('web3');

module.exports = {
  solc: {
    version: "^0.4.24",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      provider: () =>{ 
        return new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, process.env.DEVELOPMENT_URL);     
      },
      gasPrice: 0,
      gas: 690000000,
      network_id: '*',
    }
  }
};
