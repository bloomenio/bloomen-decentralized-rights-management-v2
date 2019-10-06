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
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.registerClaim(claim.creationDate, encodeData, claim.claimType/*, claim.memberReceptor*/).send(this.args);
            });
    }

    public updateClaim(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        return this.transactionService.addTransaction(this.args.gas, () => {
               return this.contract.methods.updateClaim(claim.claimId, encodeData, new Date().getTime()).send(this.args);
        });
    }

    public changeState(claimId: string, state: number, message: string, memberId: string, memberLogo: string) {
        return this.transactionService.addTransaction(this.args.gas, () => {
            // Change this when contract message claims changed
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
                        claim.claimData.forEach(dataItem => {
                            if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                data[dataItem[0]] = dataItem[1].split(',');
                            } else {
                                data[dataItem[0]] = dataItem[1];
                            }
                        });
                        claim.claimData = data;
                        return claim;
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }

    public getClaimsByMemberId(page): Promise<any> {
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
                            claim.claimData.forEach(dataItem => {
                                if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes') {
                                    data[dataItem[0]] = dataItem[1].split(',');
                                } else {
                                    data[dataItem[0]] = dataItem[1];
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

    public getClaimsCountByMemberId(): Promise<number> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                this.contract.methods.getClaimsCountByMemberId().call(this.args).then(resolve, reject);
            });
        });
    }
}
