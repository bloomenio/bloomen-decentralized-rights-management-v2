import {default as JSON} from '../json/Registry.json';
import {Contract} from '../contract';
// Environment
import {environment} from '@env/environment';
// Services
import {Logger} from '@services/logger/logger.service';
import {Web3Service} from '@services/web3/web3.service';
import {TransactionService} from '@services/web3/transactions/transaction.service';
import {ClaimModel} from '@core/models/claim.model.js';

import * as RLP from 'rlp';
import {map} from 'rxjs/operators';
import {from} from 'rxjs';
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;

const log = new Logger('member.contract');

export class ClaimsContract extends Contract {

    constructor(
        public contractAddress: string,
        public contract: any,
        public web3Service: Web3Service,
        public transactionService: TransactionService
    ) {
        super(contractAddress, contract, web3Service, transactionService);
    }

    public static get ABI() { return JSON.abi; }
    public static get ADDRESS() { return JSON.networks[environment.eth.contractConfig.networkId].address; }

    public addClaim(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        console.log('in addClaim, contract address is ', ClaimsContract.ADDRESS);
        let claimType: boolean;
        if (claim.claimType === ClaimTypeEnum.MUSICAL_WORK) {
            claimType = false;
        } else if (claim.claimType === ClaimTypeEnum.SOUND_RECORDING) {
            claimType = true;
        }
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.registerClaim(claim.creationDate, encodeData, claimType, claim.memberOwner).send(this.args);
            });
    }

    public updateCl(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        console.log('in updateCl, contract address is ', ClaimsContract.ADDRESS);
        console.log(claim);
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.updateClaim(claim.claimId, encodeData, new Date().getTime()).send(this.args);
        });
    }

    public changingState(claimId: string, state: number, message: string, memberId: string, memberLogo: string) {
        return this.transactionService.addTransaction(this.args.gas, () => {
            // Change this when contract message claims changed
            console.log('in changingState, contract address is ', ClaimsContract.ADDRESS);
            const lastUpdate = new Date().getTime();
            const messageItem = {
                memberId,
                message,
                time: lastUpdate,
                memberLogo
            };
            const stringMessage = global.JSON.stringify(messageItem);
            console.log(claimId, state, lastUpdate, stringMessage);
            return this.contract.methods.changeState(claimId, state, stringMessage, lastUpdate).send(this.args);
        });
    }

    public getClaimById(claimId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                return from(this.contract.methods.getClaim(claimId).call(this.args)).pipe(
                    map((claim: ClaimModel) => {
                        const data = {};
                        console.log('In getClaimById contract address is ', ClaimsContract.ADDRESS);
                        claim.claimData.forEach(dataItem => {
                            if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                data[dataItem[0]] = dataItem[1].split(',');
                            } else {
                                data[dataItem[0]] = dataItem[1];
                            }
                        });
                        claim.claimData = data;
                        console.log(claim);
                        return claim;
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }

    public getClaimsByMemId(page): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                return from(this.contract.methods.getClaimsByMemberId(page).call(this.args)).pipe(
                    map((claims: ClaimModel[]) => {
                        return claims.filter((claim: ClaimModel) => {
                            return claim.claimId > 0;
                        });
                    }),
                    map((claims) => {
                        return claims.map(claim => {
                            const data = {};
                            console.log('In getClaimByMemId contract address is ', ClaimsContract.ADDRESS);
                            claim.claimData.forEach(dataItem => {
                                if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                    data[dataItem[0]] = dataItem[1].split(',');
                                } else {
                                    data[dataItem[0]] = dataItem[1];
                                }
                            });
                            claim.claimData = data;
                            console.log(claim);
                            return claim;
                        });
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }

    public getClaimsCountByMemId(): Promise<number> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                this.contract.methods.getClaimsCountByMemberId().call(this.args).then(resolve, reject);
            });
        });
    }
}
