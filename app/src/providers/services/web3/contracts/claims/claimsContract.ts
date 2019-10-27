import { default as JSON } from '../json/Registry.json';
import { Contract } from '../contract';

// Environment
import { environment } from '@env/environment';

// Services
import { Logger } from '@services/logger/logger.service';
import { Web3Service } from '@services/web3/web3.service';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { ClaimModel } from '@core/models/claim.model.js';

import * as RLP from 'rlp';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

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
        console.log('in addClaim, address is ', ClaimsContract.ADDRESS);
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.registerClaim(claim.creationDate, encodeData, claim.claimType, claim.memberReceptor).send(this.args);
            });
    }

    public updateCl(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        console.log('in updateCl, address is ', ClaimsContract.ADDRESS);
        return this.transactionService.addTransaction(this.args.gas, () => {
            // const bytecode = JSON.bytecode; // .networks[process.env.DEVELOPMENT_NETWORKID].address);
            // const event = bytecode.SavingClaimInfo(function(error, result) {
            //     if (!error) {
            //         console.log(result);
            //     }
            // });
            return this.contract.methods.updateClaim(claim.claimId, encodeData, new Date().getTime()).send(this.args);
        });
    }

    public changingState(claimId: string, state: number, message: string, memberId: string, memberLogo: string) {
        return this.transactionService.addTransaction(this.args.gas, () => {
            // Change this when contract message claims changed
            console.log('in changingState, address is ', ClaimsContract.ADDRESS);
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
                        console.log('in getClaimById, address is ', ClaimsContract.ADDRESS);
                        claim.claimData.forEach(dataItem => {
                            if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                data[dataItem[0]] = dataItem[1].split(',');
                            } else {
                                data[dataItem[0]] = dataItem[1];
                            }
                            console.log(dataItem, ' \n');
                        });
                        claim.claimData = data;
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
                            console.log('claim.claimData by MemberId \n');
                            console.log('oldClaimStatus: ', claim.status);
                            console.log('in getClaimByMemId, address is ', ClaimsContract.ADDRESS);
                            // const event = contractInstance.allEvents(function (error, res) {
                            //     if (!error) {
                            //         console.log(res);
                            //     }
                            // });

                            // if (claim.status == 2) {
                            //     claim.status = 1;
                            // } else if (claim.status == 3) {
                            //     claim.status = 0;
                            // } else if (claim.status == 4) {
                            //     claim.status = 1;
                            // }
                            // console.log('newClaimStatus: ', claim.status, ' \n');
                            claim.claimData.forEach(dataItem => {
                                if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                    data[dataItem[0]] = dataItem[1].split(',');
                                } else {
                                    data[dataItem[0]] = dataItem[1];
                                }
                                if (dataItem[0] === 'ISRC' || dataItem[0] === 'ISWC' || dataItem[0] === 'title') {
                                    console.log(dataItem);
                                }
                            });
                            claim.claimData = data;
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
