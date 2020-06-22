import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import * as fromUserActions from './user.actions';
import * as fromMemberActions from '@stores/member/member.actions';
import { Logger } from '@services/logger/logger.service';
import { UserContract } from '@services/web3/contracts/user/userContract';
import { ApplicationDataDatabaseService } from '@db/application-data-database.service';
import { Store } from '@ngrx/store';
import { UserModel } from '@core/models/user.model';
import { Web3Service } from '@services/web3/web3.service';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';
import {currentUser, InboxComponent} from '@pages/inbox/inbox.component';
import {Router} from '@angular/router';

const log = new Logger('user-data.effects');

@Injectable()
export class UserEffects {

    constructor(
        private actions$: Actions<fromUserActions.UserActions>,
        private userContract: UserContract,
        private applicationDatabaseService: ApplicationDataDatabaseService,
        private router: Router,
        private store: Store<any>,
        private web3Service: Web3Service,
        public inboxComponent: InboxComponent
    ) { }

    @Effect({ dispatch: false }) public initUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.INIT_USER),
        map(() => {
            this.applicationDatabaseService.get(APPLICATION_DATA_CONSTANTS.USER).toPromise().then((userDb) => {
                if (userDb) {
                    // console.log('FROM INIT USER: ');
                    // console.log(userDb);
                    this.store.dispatch(new fromUserActions.InitUserSuccess(userDb));
                    this.store.dispatch(new fromMemberActions.SelectMember(userDb.memberId));
                }
            });
        })
    );

    @Effect({ dispatch: false }) public sendUserToBlockchain = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.SEND_USER),
        map((action) => {
            this.web3Service.ready(() => {
                this.applicationDatabaseService.set(APPLICATION_DATA_CONSTANTS.IS_FORM_FILLED, true);
                this.userContract.addUser(action.payload);
            });
        })
    );

    @Effect({ dispatch: false }) public addUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.ADD_USER),
        map(async () => {
            const userBc = await this.userContract.getMe();
            const user: UserModel = {
                // creationDate: userBc.creationDate,
                firstName: userBc.firstName,
                lastName: userBc.lastName,
                role: userBc.role,
                requestId: userBc.requestId,
                status: userBc.status,
                memberId: userBc.memberId,
                owner: userBc.owner,
                cmo: userBc.cmo,
                groups: userBc.groups,
                tokens: userBc.tokens,
                kycData: userBc.kycData
            };
            // console.log('FROM ADD USER: ');
            // console.log(user);
            this.applicationDatabaseService.set(APPLICATION_DATA_CONSTANTS.USER, user);
            this.store.dispatch(new fromUserActions.AddUserSuccess(user));
            this.store.dispatch(new fromMemberActions.SelectMember(user.memberId));
        })
    );

    @Effect({ dispatch: false }) public updateUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.UPDATE_USER),
        map((action) => {
            this.web3Service.ready(() => {
                this.userContract.updateUser(action.payload).then(() => {
                    this.store.dispatch(new fromUserActions.AddUser);
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );

    @Effect({ dispatch: false }) public updateSuperUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.UPDATE_SUPERUSER),
        map((action) => {
            this.web3Service.ready(async () => {
                // @ts-ignore
                const actionPayload = action.payload;
                await this.userContract.updateSuperUser(actionPayload).then(() => {
                        this.store.dispatch(new fromUserActions.AddUser());
                }, (error) => { log.error(error); })
                    .then(() => {   // to refresh current user data
                        if (this.router.routerState.snapshot.url === '/inbox') {
                            this.router.navigate(['member-management']).then(() => {
                                this.router.navigate(['inbox']); });
                        } else {
                            this.router.navigate(['inbox']).then(() => {
                                this.router.navigate(['member-management']); });
                        }
                    });
            });
        })
    );

    @Effect({ dispatch: false }) public acceptUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.ACCEPT_USER),
        map((action) => {
            this.web3Service.ready(() => {
                this.userContract.acceptUser(action.payload).then(() => {
                    this.store.dispatch(new fromMemberActions.InitMember);
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );

    @Effect({ dispatch: false }) public rejectUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.REJECT_USER),
        map((action) => {
            this.web3Service.ready(() => {
                this.userContract.rejectUser(action.payload).then(() => {
                    this.store.dispatch(new fromMemberActions.InitMember);
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );

    @Effect({ dispatch: false }) public removeUser = this.actions$.pipe(
        ofType(fromUserActions.UserActionTypes.REMOVE_USER),
        map(() => {
            this.applicationDatabaseService.set(APPLICATION_DATA_CONSTANTS.IS_FORM_FILLED, false);
            this.applicationDatabaseService.remove(APPLICATION_DATA_CONSTANTS.USER);
            this.store.dispatch(new fromUserActions.RemoveUserSuccess());
            this.store.dispatch(new fromMemberActions.UnselectMember());
        })
    );
}





