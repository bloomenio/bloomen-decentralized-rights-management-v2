import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from '@stores/mnemonic/mnemonic.reducer';
import { MnemonicModel } from '@core/models/mnemonic.model';


export const MnemonicState = createFeatureSelector<MnemonicModel>('mnemonic');

export const getMnemonic = createSelector(MnemonicState, fromReducer.getCurrentMnemonic);
