require('dotenv').config();
const inquirer = require('inquirer');
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = process.env.DEVELOPMENT_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Users.json', 'utf8'));
const GAS = 9999999; // 900000

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
            getMembers(process.argv[3]);
            break;
        case 'add':
            addMember();
            break;
        case 'count':
            count(process.argv[3]);
            break;
        case 'remove':
            removeMember(process.argv[3]);
            break;
        default:
            console.log('no command... get|set')
    }
    hdprovider.engine.stop();
}

// GET

function getMembers(cmo) {
    if (cmo) {
        contractInstance.methods.getMembers(0, cmo).call(transactionObject).then(
            (result) => {
                console.log('GET:', result)
            });
    } else {
        contractInstance.methods.getMembers().call(transactionObject).then(
            (result) => {
                console.log('GET:', result)
            });
    }
}

//ADD

async function addMember() {

    let questions = [
        { type: 'input', name: 'name', message: 'Specify name:' },
        { type: 'input', name: 'logo', message: 'Specify logo:' },
        { type: 'input', name: 'country', message: 'Specify country:' },
        { type: 'input', name: 'cmo', message: 'Specify cmo:' },
        { type: 'input', name: 'theme', message: 'Specify theme:' }
    ];

    let answer = await inquirer.prompt(questions);
    let creationDate = new Date().getTime();

    contractInstance.methods.addMember(creationDate, answer.name, answer.logo, answer.country, answer.cmo, answer.theme)
        .send(transactionObject).then(checkTransaction);

}

//COUNT

async function count(cmo) {
    if (cmo) {
        contractInstance.methods.getCount(cmo).call(transactionObject).then(checkCount);
    } else {
        contractInstance.methods.getCount().call(transactionObject).then(checkCount);
    }
}

// REMOVE

async function removeMember(memberId) {
    contractInstance.methods.removeMember(memberId).send(transactionObject).then(checkTransaction);
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

function checkCount(result) {
    console.log("COUNT:", result);
}

doStuff();
