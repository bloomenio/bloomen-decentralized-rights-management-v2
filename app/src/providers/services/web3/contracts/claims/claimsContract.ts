import {default as JSON} from '../json/Claims.json';
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

const log = new Logger('claims.contract');

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
        // console.log('claim.claimData:');
        // console.log(claim.claimData);
        // console.log(claim.claimData[0][1]); // compare [1][1], [2][1], [3][1], [4][1] => if some differs then updateClaimId = true.
        const encodeData = RLP.encode(claim.claimData);
        const encodeOldData = RLP.encode(claim.claimData);
        let claimType: boolean;
        if (claim.claimType === ClaimTypeEnum.MUSICAL_WORK) {
            claimType = false;
        } else if (claim.claimType === ClaimTypeEnum.SOUND_RECORDING) {
            claimType = true;
        }
        console.log('ClaimsContract.addClaim');
        console.log(claim.creationDate, claim.claimData, claimType, claim.memberOwner, true,
            1, claim.claimData, new Date().getTime());
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.computeClaim(claim.creationDate, encodeData, claimType, claim.memberOwner, true,
                1, encodeOldData, new Date().getTime(), false
            ).send(this.args);
            });
    }

    public updateCl(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        const encodeOldData = RLP.encode(claim.oldClaimData);
        // If date, territories or types changed, then it is a new claim with new claimId.
        let updateClaimId = false;
        if (claim.oldClaimData[1][1] !== claim.claimData[1][1] || claim.oldClaimData[2][1] !== claim.claimData[2][1] ||
            claim.oldClaimData[3][1] !== claim.claimData[3][1] || claim.oldClaimData[4][1] !== claim.claimData[4][1]) {
            updateClaimId = true;
        }
        console.log('updateClaimId: ' + updateClaimId);
        console.log('ClaimsContract.updateCl');
        console.log(claim.creationDate, claim.claimData, claim.claimType, claim.memberOwner, false,
            claim.claimId, claim.oldClaimData, new Date().getTime(), updateClaimId);
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.computeClaim(claim.creationDate, encodeData, claim.claimType, claim.memberOwner, false,
                claim.claimId, encodeOldData, new Date().getTime(), false
            ).send(this.args);
        });
    }

    public delClaim(claim: ClaimModel): Promise<any> {
        const encodeData = RLP.encode(claim.claimData);
        const encodeOldData = RLP.encode(claim.oldClaimData);
        let claimType: boolean;
        if (claim.claimType === ClaimTypeEnum.MUSICAL_WORK) {
            claimType = false;
        } else if (claim.claimType === ClaimTypeEnum.SOUND_RECORDING) {
            claimType = true;
        }
        console.log('ClaimsContract.delClaim');
        console.log(claim.creationDate, claim.claimData, claim.claimType, claim.memberOwner, false,
            claim.claimId, claim.oldClaimData, new Date().getTime());
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.computeClaim(0, encodeData, claimType, claim.memberOwner, false,
                claim.claimId, encodeOldData, new Date().getTime(), false   // oldClaimData==claimData
            ).send(this.args);
        });
    }

    public changingState(claimId: string, state: number, message: string, memberId: string, memberLogo: string) {
        return this.transactionService.addTransaction(this.args.gas, () => {
            // Change this when contract message claims changed
            console.log('ClaimsContract.changingState');
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
        // console.log('ClaimsContract.getClaimById');
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                return from(this.contract.methods.getClaim(claimId).call(this.args)).pipe(
                    map((claim: ClaimModel) => {
                        const data = {};
                        claim.claimData.forEach(dataItem => {
                            if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes' || dataItem[0] === 'rightTypes') {
                                data[dataItem[0]] = dataItem[1].split(',');
                            } else {
                                data[dataItem[0]] = dataItem[1];
                            }
                        });
                        claim.claimData = data;
                        // console.log(claim);
                        return claim;
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }

    public getClaimsByMemId(page): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                console.log('ClaimsContract.getClaimByMemId');
                // console.log('serverUrl: ', environment.serverUrl);
                // console.log('page: ' + page);
                // console.log('this.args.from: ' + this.args.from);
                return from(this.contract.methods.getClaimsByMemberId(page).call(this.args)).pipe(
                    map((claims: ClaimModel[]) => {
                        // console.log('ClaimsContract.getClaimByMemId.map1');
                        return claims.filter((claim: ClaimModel) => {
                            return claim.claimId > 0;
                        });
                    }),
                    map((claims) => {
                        // console.log('ClaimsContract.getClaimByMemId.map2');
                        return claims.map(claim => {
                            const data = {};
                            claim.claimData.forEach(dataItem => {
                                if (dataItem[0] === 'countries' || dataItem[0] === 'useTypes' || dataItem[0] === 'rightTypes') {
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
