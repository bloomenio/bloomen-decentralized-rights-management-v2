require('dotenv').config();
const inquirer = require('inquirer');
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = process.env.DEVELOPMENT_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/Registry.json', 'utf8'));
const GAS = 990000;

const Web3 = require('web3');

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

var hdprovider = new HDWalletProvider(mnemonic, process.env.DEVELOPMENT_URL);

const web3 = new Web3(hdprovider);

const RLP = require('rlp');

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};

const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

function doStuff() {
    switch (process.argv[2]) {
        case 'getByMember':
            getClaimsByMemId();
            break;
        case 'getById':
            getClaimById(process.argv[3]);
            break;
        case 'update':
            update();
            break;
        case 'add':
            addClaim();
            break;
        case 'count':
            getClaimsCountByMemId();
            break;
        default:
            console.log('no command... get|set')
    }
    hdprovider.engine.stop();
}

// GET
function getClaimsByMemId() {
    contractInstance.methods.getClaimsByMemberId(0).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

function getClaimById(claimId) {
    contractInstance.methods.getClaim(claimId).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

// ADD
async function addClaim() {

    let questions = [
        {type: 'number', name: 'type', message: 'Claim type:'},
        {type: 'number', name: 'memberReceptor', message: 'Claim member receptor id:'},
        {type: 'number', name: 'status', message: 'Claim status:'},
    ];

    let answer = await inquirer.prompt(questions);
    let creationDate = new Date().getTime();


    var data = RLP.encode([['test', 'value'], ['test2', 'value']]);
    contractInstance.methods.registerClaim(creationDate, data, answer.type, answer.memberReceptor, 'testing')
        .send(transactionObject).then(checkTransaction);
}

// UPDATE
async function update() {

    let questions = [
        {type: 'number', name: 'claimId', message: 'Claim id:'},
        {type: 'number', name: 'status', message: 'Claim status:'}
    ];

    let answer = await inquirer.prompt(questions);

    var data = RLP.encode([['test', 'value'], ['test2', 'value']]);
    contractInstance.methods.updateClaim(answer.claimId, data, 'testing', answer.status)
        .send(transactionObject).then(checkTransaction);
}


// COUNT
async function getClaimsCountByMemId() {
    contractInstance.methods.getClaimsCountByMemberId().call(transactionObject).then(checkCount);
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
