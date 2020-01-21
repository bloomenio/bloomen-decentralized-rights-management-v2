import { default as JSON } from '../json/Users.json';
import { Contract } from '../contract';

// Environment
import { environment } from '@env/environment';

// Services
import { Logger } from '@services/logger/logger.service';
import { Web3Service } from '@services/web3/web3.service';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { MemberModel } from '@core/models/member.model.js';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import {UserModel} from "@models/user.model";

const log = new Logger('member.contract');


export class MemberContract extends Contract {

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

    public addMember(member: MemberModel) {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.addMember(member.creationDate, member.name, member.logo, member.country, member.cmo, member.theme).send(this.args);
        });
    }

    public updateMember(member: MemberModel): Promise<any> {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.updateMember(member.memberId, member.creationDate, member.name, member.logo, member.country, member.cmo,
                member.theme).send(this.args);
        });
    }

    public getAllMembers(): Promise<MemberModel[]> {
        return this.contract.methods.getMembers().call(this.args);
    }

    public getCountMembers(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.web3Service.ready(() => {
                return this.contract.methods.getCount().call(this.args).then(resolve, reject);
            });
        });
    }

    public getMembers(page: number = 0): Promise<MemberModel[]> {
        return new Promise<MemberModel[]>((resolve, reject) => {
            this.web3Service.ready(() => {
                return from(this.contract.methods.getMembers(page).call(this.args)).pipe(
                    map((members: MemberModel[]) => {
                        return members.filter((member: MemberModel) => {
                            return member.memberId > 0;
                        });
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }
}
