import { Action } from '@ngrx/store';

export enum CMOsActionTypes {
    INIT_CMOS = '[cmos] init cmos',
    INIT_CMOS_SUCCESS = '[cmos] init cmos success'
}

export class InitCMOs implements Action {
    public readonly type = CMOsActionTypes.INIT_CMOS;
}

export class InitCMOsSuccess implements Action {
    public readonly type = CMOsActionTypes.INIT_CMOS_SUCCESS;
    constructor(public readonly payload: string[]) { }
}

export type CmosActions = InitCMOs | InitCMOsSuccess;
