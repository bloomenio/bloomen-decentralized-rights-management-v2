import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

// Constants
import { map } from 'rxjs/operators';

// Actions
import * as fromClaimActions from './claim.actions';
import * as fromMemberActions from '@stores/member/member.actions';
import { Logger } from '@services/logger/logger.service';

import { Store } from '@ngrx/store';
import { Web3Service } from '@services/web3/web3.service';
import { ClaimsContract } from '@core/core.module';

const log = new Logger('claim.effects');

@Injectable()
export class ClaimEffects {

    constructor(
        private actions$: Actions<fromClaimActions.ClaimActions>,
        private claimsContract: ClaimsContract,
        private store: Store<any>,
        private web3Service: Web3Service
    ) { }

    @Effect({ dispatch: false }) public initUser = this.actions$.pipe(
        ofType(fromClaimActions.ClaimActionTypes.CHANGE_CLAIM_STATE),
        map((action) => {
            this.web3Service.ready(() => {
                this.claimsContract.changeState(action.payload.claimsId, action.payload.status, action.payload.message,
                    action.payload.memberId, action.payload.memberLogo).then(() => {
                        this.store.dispatch(new fromMemberActions.InitMember());
                    }, (error) => {
                        log.error(error);
                    });
            });
        })
    );
}





