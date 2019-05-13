import { MnemonicActionTypes, MnemonicActions } from './mnemonic.actions';
import { MnemonicModel } from '@core/models/mnemonic.model';

const initialState: MnemonicModel = {
    currentMnemonic: undefined
};

export function mnemonicReducer(state: MnemonicModel = initialState, action: MnemonicActions): MnemonicModel {
    switch (action.type) {

        case MnemonicActionTypes.INIT_MNEMONIC_SUCCESS: {
            return { ...state, ...action.payload };
        }

        case MnemonicActionTypes.ADD_MNEMONIC_SUCCESS: {
            return { ...state, ...action.payload };
        }

        case MnemonicActionTypes.REMOVE_MNEMONIC_SUCCESS: {
            return { ...state, currentMnemonic: undefined };
        }

        default:
            return state;
    }
}

export const getCurrentMnemonic = (state: MnemonicModel) => state.currentMnemonic;
