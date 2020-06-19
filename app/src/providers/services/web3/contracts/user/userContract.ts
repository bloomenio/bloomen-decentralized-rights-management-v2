import { default as JSON } from '../json/Users.json';
import { Contract } from '../contract';

// Environment
import { environment } from '@env/environment';

// Services
import { Logger } from '@services/logger/logger.service';
import { Web3Service } from '@services/web3/web3.service';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { UserModel } from '@core/models/user.model.js';
import { of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {MemberModel} from '@models/member.model';

const log = new Logger('member.contract');


export class UserContract extends Contract {

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

    /**
     * Save a member into the blockchain returning the memberId generated as a promise.
     * @param member memberObject
     */
    public addUser(user: UserModel): Promise<any> {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.registerUserRequest(user.creationDate, user.firstName, user.lastName,
                user.role, user.memberId, user.kycData).send(this.args);
        });
    }

    public getUsersOwner() {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                return this.contract.methods.getUsersOwner().call(this.args).then(resolve, reject);
            });
        });
    }

    public updateUser(user: UserModel): Promise<any> {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.updateUser(user.firstName, user.lastName, user.memberId, user.role,
                user.owner, user.tokens, user.kycData).send(this.args);
        });
    }

    public getUsedTokens(memberId): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.web3Service.ready(() => {
                return this.contract.methods.getUsedTokens(memberId).call(this.args).then(resolve, reject);
            });
        });
    }

    public updateSuperUser(user: UserModel): Promise<any> {
        // console.log('from userContract.updateSuperUser\n', user);
        return this.transactionService.addTransaction(this.args.gas, () => {
            // console.log('from userContract.updateSuperUser ARGUMENTS: \n', user.firstName, user.lastName, user.memberId, user.role, user.owner, user.groups);
            return this.contract.methods.updateSuperUser(user.firstName, user.lastName, user.memberId, user.role,
                user.owner, user.groups).send(this.args);
        });
    }

    public acceptUser(address: string): Promise<any> {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.acceptUser(address).send(this.args);
        });
    }

    public rejectUser(address: string): Promise<any> {
        return this.transactionService.addTransaction(this.args.gas, () => {
            return this.contract.methods.rejectUser(address).send(this.args);
        });
    }


    public getMe(): Promise<UserModel> {
        return this.contract.methods.getMe().call(this.args);
    }

    public getUsersByMember(page: number): Promise<UserModel[]> {
        return new Promise<UserModel[]>((resolve, reject) => {
            this.web3Service.ready(() => {
                // console.log('UserContract');
                // console.log('page: ', page);
                return from(this.contract.methods.getUsers(page).call(this.args)).pipe(
                    map((users: UserModel[]) => {
                        return users.filter((user: UserModel) => {
                            return user.creationDate > 0;
                        });
                    })
                ).toPromise().then(resolve, reject);
            });
        });
    }

    public getUserByAddress(address): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.web3Service.ready(() => {
                return this.contract.methods.getUserByAddress(address).call(this.args).then(resolve, reject);
            });
        });
    }

    public getUsersCountByMember(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.web3Service.ready(() => {
                return this.contract.methods.getcountUsers().call(this.args).then(resolve, reject);
            });
        });
    }

}
