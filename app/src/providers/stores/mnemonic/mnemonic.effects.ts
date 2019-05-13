import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

// Constants
import { map, switchMap } from 'rxjs/operators';

// Actions
import * as fromActions from './mnemonic.actions';
import * as fromCmosActions from '@stores/cmos/cmos.actions';
import * as fromMemberActions from '@stores/member/member.actions';

import { Logger } from '@services/logger/logger.service';

import { MnemonicDatabaseService } from '@db/mnemonic-database.service';
import { from } from 'rxjs';
import { Web3Service } from '@services/web3/web3.service';
import { MnemonicModel } from '@core/models/mnemonic.model';

import * as fromActionUser from '@stores/user/user.actions';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';

const log = new Logger('mnemonic.effects');

@Injectable()
export class MnemonicEffects {

    constructor(
        private actions$: Actions<fromActions.MnemonicActions>,
        private mnemonicDatabaseService: MnemonicDatabaseService,
        private web3Service: Web3Service,
        private store: Store<any>
    ) { }

    @Effect() public initMnemonic = this.actions$.pipe(
        ofType(fromActions.MnemonicActionTypes.INIT_MNEMONIC),
        switchMap(() => {
            return from(this.mnemonicDatabaseService.get(APPLICATION_DATA_CONSTANTS.MNEMONIC).pipe(
                map((mnemonic) => {
                    if (mnemonic) {
                        this.web3Service.changeWallet(mnemonic).then(() => {
                            this.store.dispatch(new fromActionUser.InitUser());
                            this.store.dispatch(new fromCmosActions.InitCMOs());
                            this.store.dispatch(new fromMemberActions.InitMember());
                        });
                    }
                    return new fromActions.InitMnemonicSuccess({ currentMnemonic: mnemonic });
                })
            ));
        })
    );

    @Effect() public addMnemonic = this.actions$.pipe(
        ofType(fromActions.MnemonicActionTypes.ADD_MNEMONIC),
        switchMap((action) => {
            let mnemonic: MnemonicModel;
            if (action.payload) {
                mnemonic = {
                    currentMnemonic: action.payload.randomSeed
                };
            } else {
                mnemonic = {
                    currentMnemonic: this.web3Service.generateRandomSeed()
                };
            }
            this.web3Service.changeWallet(mnemonic.currentMnemonic).then(() => {
                this.store.dispatch(new fromActionUser.InitUser());
                this.store.dispatch(new fromCmosActions.InitCMOs());
                this.store.dispatch(new fromMemberActions.InitMember());
            });
            return from(this.mnemonicDatabaseService.set(APPLICATION_DATA_CONSTANTS.MNEMONIC, mnemonic.currentMnemonic).pipe(
                map(() => new fromActions.AddMnemonicSuccess(mnemonic))
            ));
        })
    );

    @Effect() public removeMnemonic = this.actions$.pipe(
        ofType(fromActions.MnemonicActionTypes.REMOVE_MNEMONIC),
        switchMap(() => {
            return from(this.mnemonicDatabaseService.remove(APPLICATION_DATA_CONSTANTS.MNEMONIC).pipe(
                map(() => new fromActions.RemoveMnemonicSuccess())
            ));
        })
    );
}





