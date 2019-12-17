require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = process.env.DEVELOPMENT_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Users.json', 'utf8'));
const GAS = 9999999; // 100000

const Web3 = require('web3');

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

var hdprovider = new HDWalletProvider(mnemonic, process.env.DEVELOPMENT_URL);

const web3 = new Web3(hdprovider);

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};

const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

function doStuff() {
    switch (process.argv[2]) {
        case 'get':
            get();
            break;
        case 'set':
            set(process.argv[3]);
            break;
        case 'remove':
            remove(process.argv[3]);
            break;
        default:
            console.log('no command... get|set')
    }
    hdprovider.engine.stop();
}


function get() {
    contractInstance.methods.getCMOs().call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

async function set(value) {
    contractInstance.methods.addCMO(value).send(transactionObject).then(checkTransaction);
}

async function remove(index) {
    contractInstance.methods.deleteCMO(index).send(transactionObject).then(checkTransaction);
}

function checkTransaction(result) {
    web3.eth.getTransactionReceipt(result,
        (status) => {
            if (GAS == status.gasUsed) {
                //transaction error
                console.log('KO');
            } else {
                console.log('OK');
            }
        }
    );
}

doStuff();
