import { Action } from '@ngrx/store';

export enum ClaimActionTypes {
    CHANGE_CLAIM_STATE = '[Claim] change claim state',

}

export class ChangeState implements Action {
    public readonly type = ClaimActionTypes.CHANGE_CLAIM_STATE;
    constructor(public readonly payload: { claimsId: string, status: number, message: string, memberId: string, memberLogo: string }) { }
}

export type ClaimActions = ChangeState;
