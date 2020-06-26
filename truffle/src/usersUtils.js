require('dotenv').config();

const inquirer = require('inquirer');

var HDWalletProvider = require("@truffle/hdwallet-provider");

var mnemonic = process.env.DEVELOPMENT_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Users.json', 'utf8'));
const GAS = 99999999;

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
        case 'registerUser':
            registerUser();
            break;
        case 'updateUser':
            updateUser();
            break;
        case 'acceptUser':
            acceptUser();
            break;
        case 'rejectUser':
            rejectUser();
            break;
        case 'get':
            getUsers(process.argv[3]);
            break;
        case 'getUsersOwner':
            getUsersOwner();
            break;
        case 'getUserByAddress':
            getUserByAddress();
            break;
        case 'getMe':
            getMe();
            break;
        case 'whitelist':
            addWhitelist()
            break;
        case 'isSigner':
            isSigner()
            break;
        default:
            console.log('no command... get|set')
    }
    hdprovider.engine.stop();
}

async function registerUser() {
    let questions = [
        { type: 'input', name: 'firstName', message: 'Specify the first name:' },
        { type: 'input', name: 'lastName', message: 'Specify the last name:' },
        { type: 'input', name: 'memberId', message: 'Specify the member Id:' },
        { type: 'input', name: 'role', message: 'Specify the role user:' },
        { type: 'input', name: 'kycData', message: 'Specify the IPFS KYC CID link:' }
    ];

    let answer = await inquirer.prompt(questions);

    let creationDate = new Date().getTime();

    contractInstance.methods.registerUserRequest(creationDate, answer.firstName, answer.lastName, answer.role,
        answer.memberId, answer.kycData)
        .send(transactionObject).then(checkTransaction);
}

async function updateUser() {
    let questions = [
        { type: 'input', name: 'firstName', message: 'Specify the first name:' },
        { type: 'input', name: 'lastName', message: 'Specify the last name:' },
        { type: 'number', name: 'memberId', message: 'Specify the member Id:' },
        { type: 'input', name: 'role', message: 'Specify the role user:' },
        { type: 'input', name: 'address', message: 'Specify the address:' },
        { type: 'input', name: 'tokens', message: 'Specify the tokens:' },
        { type: 'input', name: 'kycData', message: 'Specify the kycData IPFS address:' },
    ];

    let answer = await inquirer.prompt(questions);

    contractInstance.methods.updateUser(answer.firstName, answer.lastName, answer.memberId, answer.role,
        answer.address, answer.tokens, answer.kycData)
        .send(transactionObject).then(checkTransaction);
}

async function rejectUser() {
    let questions = [
        { type: 'input', name: 'address', message: 'Specify the address user:' }
    ];

    let rejectUserAddress = await inquirer.prompt(questions);

    contractInstance.methods.rejectUser(rejectUserAddress.address).send(transactionObject).then(checkTransaction);
}

async function acceptUser() {
    let questions = [
        { type: 'input', name: 'address', message: 'Specify the address user:' }
    ];

    let acceptUserAddress = await inquirer.prompt(questions);

    contractInstance.methods.acceptUser(acceptUserAddress.address).send(transactionObject).then(checkTransaction);
}

async function getUserByAddress() {
    let questions = [
        { type: 'input', name: 'address', message: 'Specify the address user:' }
    ];

    let answer = await inquirer.prompt(questions);
    contractInstance.methods.getUserByAddress(answer.address).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

function getUsers(status) {
    contractInstance.methods.getUsers(0).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

function getMe() {
    contractInstance.methods.getMe().call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        }).then(checkTransaction);
}

function getUsersOwner() {
    contractInstance.methods.getUsersOwner().call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

async function addWhitelist() {
    let questions = [
        { type: 'input', name: 'address', message: 'Specify the user address:' },
        { type: 'input', name: 'cmo', message: 'Specify the CMO:' },
    ];

    let whitelistUser = await inquirer.prompt(questions);

    contractInstance.methods.whitelistAdmin(whitelistUser.address, whitelistUser.cmo.toString())
        .send(transactionObject).then(checkTransaction);
}

async function isSigner() {
    let questions = [
        { type: 'input', name: 'address', message: 'Specify the user address:' }
    ];

    let whitelistUser = await inquirer.prompt(questions);

    contractInstance.methods.isSigner(whitelistUser.address).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

function checkTransaction(result) {
    console.log('koko',result);
    web3.eth.getTransactionReceipt(result,
        (status) => {
            if (GAS === status.gasUsed) {
                //transaction error
                console.log('KO');
            } else {
                console.log('OK');
            }
        }
    );
}



doStuff();


