import { Action } from '@ngrx/store';
import { MnemonicModel } from '@core/models/mnemonic.model';

export enum MnemonicActionTypes {
    INIT_MNEMONIC = '[Mnemonic] init mnemonic',
    INIT_MNEMONIC_SUCCESS = '[Mnemonic] init mnemonic success',
    ADD_MNEMONIC = '[Mnemonic] add mnemonic',
    ADD_MNEMONIC_SUCCESS = '[Mnemonic] add mnemonic success',
    REMOVE_MNEMONIC = '[Mnemonic] remove mnemonic',
    REMOVE_MNEMONIC_SUCCESS = '[Mnemonic] remove mnemonic success'

}

export class InitMnemonic implements Action {
    public readonly type = MnemonicActionTypes.INIT_MNEMONIC;
}

export class InitMnemonicSuccess implements Action {
    public readonly type = MnemonicActionTypes.INIT_MNEMONIC_SUCCESS;
    constructor(public readonly payload: MnemonicModel) { }
}

export class AddMnemonic implements Action {
    public readonly type = MnemonicActionTypes.ADD_MNEMONIC;
    constructor(public readonly payload?: { randomSeed: string }) { }
}

export class AddMnemonicSuccess implements Action {
    public readonly type = MnemonicActionTypes.ADD_MNEMONIC_SUCCESS;
    constructor(public readonly payload: MnemonicModel) { }
}

export class RemoveMnemonic implements Action {
    public readonly type = MnemonicActionTypes.REMOVE_MNEMONIC;
}

export class RemoveMnemonicSuccess implements Action {
    public readonly type = MnemonicActionTypes.REMOVE_MNEMONIC_SUCCESS;
}

export type MnemonicActions = InitMnemonic | InitMnemonicSuccess | AddMnemonic | AddMnemonicSuccess | RemoveMnemonic | RemoveMnemonicSuccess;
