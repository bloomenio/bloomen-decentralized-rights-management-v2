require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");

var Web3 = require('web3');

module.exports = {
  solc: {
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
      // gas: 20000000,
      gasPrice: 0,
      network_id: '*',
    }
  }
};
