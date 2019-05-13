import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

// Constants
import { map } from 'rxjs/operators';

import { Logger } from '@services/logger/logger.service';

import * as fromActions from '@stores/cmos/cmos.actions';

import { Web3Service } from '@services/web3/web3.service';
import { RegistryContract } from '@core/core.module';
import { Store } from '@ngrx/store';

const log = new Logger('user-data.effects');

@Injectable()
export class CmosEffects {

    constructor(
        private actions$: Actions<fromActions.CmosActions>,
        private registryContract: RegistryContract,
        private web3Service: Web3Service,
        private store: Store<any>
    ) { }

    @Effect({ dispatch: false }) public initCmos = this.actions$.pipe(
        ofType(fromActions.CMOsActionTypes.INIT_CMOS),
        map(() => {
            this.web3Service.ready(() => {
                this.registryContract.getCMOs().then((cmos) => {
                    this.store.dispatch(new fromActions.InitCMOsSuccess(cmos));
                });
            });
        })
    );
}





