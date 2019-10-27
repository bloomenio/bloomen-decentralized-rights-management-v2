import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

// Constants
import { map } from 'rxjs/operators';

// Actions
import * as fromClaimActions from './claim.actions';
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
                this.claimsContract.changingState(action.payload.claimsId, action.payload.status, action.payload.message,
                    action.payload.memberId, action.payload.memberLogo).then(() => {
                        this.store.dispatch(new fromClaimActions.ChangeState(action.payload));
                    }, (error) => {
                        log.error(error);
                    });
            });
        })
    );

    @Effect({ dispatch: false }) public addClaim = this.actions$.pipe(
        ofType(fromClaimActions.ClaimActionTypes.ADD_CLAIM),
        map((action) => {
            this.web3Service.ready(() => {
                this.claimsContract.addClaim(action.payload).then(() => {
                    this.store.dispatch(new fromClaimActions.AddClaim(action.payload));
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );

    @Effect({ dispatch: false }) public updateClaim = this.actions$.pipe(
        ofType(fromClaimActions.ClaimActionTypes.UPDATE_CLAIM),
        map((action) => {
            this.web3Service.ready(() => {
                this.claimsContract.updateCl(action.payload).then(() => {
                    this.store.dispatch(new fromClaimActions.UpdateClaim(action.payload));
                }, (error) => {
                    log.error(error);
                });
            });
        })
    );
}





