require('dotenv').config();


module.exports = {
  scripts: {
    development: 'truffle migrate --reset',
    export: 'copyfiles -f build/contracts/*.json ../app/src/providers/services/web3/contracts/json',
    ganache: 'ganache-cli -g 0  -h 0.0.0.0 -i 82584648528 -p 22000 -m "'+ process.env.DEVELOPMENT_MNEMONIC + '" -l 99999999999999999',
  }
};