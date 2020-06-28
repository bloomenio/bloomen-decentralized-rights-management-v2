import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

// Constants
import { map } from 'rxjs/operators';

import { Logger } from '@services/logger/logger.service';

import * as fromActions from '@stores/member/member.actions';

import { Web3Service } from '@services/web3/web3.service';
import { MemberContract } from '@core/core.module';
import { Store } from '@ngrx/store';
import { MemberModel } from '@core/models/member.model';
import { interval } from 'rxjs';
import * as fromUserActions from '@stores/user/user.actions';

const log = new Logger('user-data.effects');

@Injectable()
export class MemberEffects {

    constructor(
        private actions$: Actions<fromActions.MemberActions>,
        private memberContract: MemberContract,
        private web3Service: Web3Service,
        private store: Store<any>
    ) { }

    @Effect({ dispatch: false }) public initMember = this.actions$.pipe(
        ofType(fromActions.MemberActionTypes.INIT_MEMBER),
        map(() => {
            this.web3Service.ready(() => {
                this.memberContract.getAllMembers().then((members) => {
                    const memberModelArray = [];
                    members.forEach((member) => {
                        const newMember: MemberModel = {
                            claimInbox: member.claimInbox,
                            claims: member.claims,
                            cmo: member.cmo,
                            country: member.country,
                            creationDate: member.creationDate,
                            logo: member.logo,
                            memberId: member.memberId,
                            name: member.name,
                            theme: member.theme,
                            userRequests: member.userRequests,
                            totalTokens: member.totalTokens
                        };
                        memberModelArray.push(newMember);
                    });
                    this.store.dispatch(new fromActions.InitMemberSuccess(memberModelArray));
                });
            });
        })
    );

    @Effect({ dispatch: false }) public updateMember = this.actions$.pipe(
        ofType(fromActions.MemberActionTypes.UPDATE_MEMBER),
        map((action) => {
            this.web3Service.ready(() => {
                this.memberContract.updateMember(action.payload).then(() => {
                    this.store.dispatch(new fromActions.InitMember);
                    console.log(action.payload);
                }, (error) => {
                    log.error(error);
                    // console.log(error);
                });
            });
        })
    );

    @Effect({ dispatch: false }) public addMember = this.actions$.pipe(
        ofType(fromActions.MemberActionTypes.ADD_MEMBER),
        map((action) => {
            this.web3Service.ready(() => {
                this.memberContract.addMember(action.payload).then(() => {
                    this.store.dispatch(new fromActions.InitMember);
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );
}





