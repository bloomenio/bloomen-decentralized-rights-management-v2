[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

# bloomen wallet truffle


# Getting started

1. Go to project folder and create a configuration file .env following  template .env.example:
 ```sh
 cp .env.example .env && vi .env
 ```

2. Install dependencies :
 ```sh
 npm install
 ```

3. Launch development task in order to deploy on blockchain (ethereum) new version of contracts:
 ```sh
 npm start development
 ```   

# Project structure

```
build/                        Local storage for deployed contracts.
contracts/                    Contracts source code
migrations/                   Truffle migrations scripts
```

# Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts).

Task                            | Description
--------------------------------|--------------------------------------------------------------------------------------
`npm start development`         | Launch development task in order to deploy on blockchain
`npm start export`              | Copy build contracts to app & cli projects
