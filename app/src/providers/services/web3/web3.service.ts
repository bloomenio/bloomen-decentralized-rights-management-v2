// Basic
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

// Ethereum
import * as lightwallet from 'eth-lightwallet';
const SignerProvider = require('ethjs-provider-signer');

const Mnemonic = require('bitcore-mnemonic');

declare var require: any;
const Web3 = require('web3');

// Environment
import { environment } from '@env/environment';

// Services
import { Logger } from '@services/logger/logger.service';

// Constants
import { WEB3_CONSTANTS } from '@core/constants/web3.constants';

const log = new Logger('web3.service');

export class CustomHttpProvider {
  private provider: any;

  constructor(path: any, timeout: any) {
    const _user = environment.eth.httpUser;
    const _password = environment.eth.httpPassword;
    const _auth = 'Basic ' + btoa(_user + ':' + _password);
    const _headers = [{ name: 'Authorization', value: _auth }];
    this.provider = new Web3.providers.HttpProvider(path, { timeout: timeout, headers: _headers });
  }

  public sendAsync(payload: any, callback: any) {
    return this.provider.send(payload, callback);
  }
}

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private blockRange: Subject<any>;
  private lastBlockNumber: number;
  private isReady: boolean;
  private currentBlockNumber: number;
  private web3: any;
  private globalKeystore: any;
  private watiningCallbacks: Array<any>;
  private myAddress: BehaviorSubject<string>;

  constructor() {

    this.blockRange = new Subject<any>();
    this.lastBlockNumber = -1;
    this.isReady = false;
    this.currentBlockNumber = -1;
    this.watiningCallbacks = [];
    this.myAddress = new BehaviorSubject<string>(undefined);
    this.web3 = new Web3();

  }

  public ready(callback: any) {
    if (this.isReady) {
      callback();
    } else {
      this.watiningCallbacks.push(callback);
    }
  }

  public createContract(abi: any, address: string) {
    return new this.web3.eth.Contract(abi, address);
  }

  public getAddress(): Observable<string> {
    return this.myAddress.asObservable();

  }

  public getLastBlockNumber(): Promise<any> {
    return this.web3.eth.getBlockNumber();
  }

  public getBlockRange(): Observable<any> {
    return this.blockRange.asObservable();
  }

  public checkTransactionStatus(txhash: string): Promise<any> {
    return this.web3.eth.getTransactionReceipt(txhash);
  }

  public fromAscii(secret: string): any {
    return this.web3.utils.fromAscii(secret);
  }

  public keccak256(secret: string): any {
    return this.web3.utils.keccak256(secret);
  }

  public changeWallet(randomSeed: string) {
    log.debug(`change Mnemonic to ${randomSeed}`);
    return this.bootstrapWeb3(randomSeed);
  }

  public generateRandomSeed(): string {
    return lightwallet.keystore.generateRandomSeed();
  }

  private bootstrapWeb3(randomSeed: string) {
    const _hdPassword = environment.eth.hdMagicKey;
    return this._setUpLightwallet(_hdPassword, randomSeed);

  }

  public validateMnemonic(mnemonic) {
    return Mnemonic.isValid(mnemonic);
  }

  private _setUpLightwallet(password: string, randomSeed: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      lightwallet.keystore.createVault({
        password: password,
        seedPhrase: randomSeed,
        hdPathString: WEB3_CONSTANTS.HD_PATH_STRING
      }, (err, ks) => {
        this.globalKeystore = ks;
        this.globalKeystore.passwordProvider = (callback: any) => {
          callback(null, password);
        };

        this.globalKeystore.keyFromPassword(password, (error: any, pwDerivedKey: any) => {
          if (error) {
            log.error(this, error);
            reject();
          } else {
            this.globalKeystore.generateNewAddress(pwDerivedKey, 1);
            const addresses = this.globalKeystore.getAddresses();
            this.myAddress.next(addresses[0]);
            this._setWeb3Provider(this.globalKeystore);
            this.isReady = true;
            this.watiningCallbacks.forEach((element: any) => {
              element();
            });
            this.watiningCallbacks = [];
            this._doTick();
            resolve();
          }
        });
      });
    });
  }

  private _doTick() {
    this.web3.eth.getBlockNumber().then((value: any) => {
      this.lastBlockNumber = this.currentBlockNumber + 1;
      this.currentBlockNumber = value;
      if (this.lastBlockNumber > 0) {
        this.blockRange.next({ fromBlock: this.lastBlockNumber, toBlock: this.currentBlockNumber });
      }
      setTimeout(() => this._doTick(), environment.eth.ethBlockPollingTime);
    }, () => setTimeout(() => this._doTick(), environment.eth.ethBlockPollingTime));
  }

  private _setWeb3Provider(_globalKeystore: any) {
    _globalKeystore.provider = CustomHttpProvider;
    const provider = new SignerProvider(environment.eth.ethRpcUrl, _globalKeystore);
    provider.options = _globalKeystore;
    this.web3.setProvider(provider);
  }


}
