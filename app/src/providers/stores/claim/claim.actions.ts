import { Action } from '@ngrx/store';
import {ClaimModel} from '@models/claim.model';

export enum ClaimActionTypes {
    CHANGE_CLAIM_STATE = '[Claim] change claim state',
    ADD_CLAIM = '[Claim] add claim',
    UPDATE_CLAIM = '[Claim] update claim'
}

export class ChangeState implements Action {
    public readonly type = ClaimActionTypes.CHANGE_CLAIM_STATE;
    constructor(public readonly payload: { claimsId: string, status: number, message: string, memberId: string, memberLogo: string }) { }
}

export class AddClaim implements Action {
    public readonly type = ClaimActionTypes.ADD_CLAIM;
    constructor(public readonly payload: ClaimModel) { }
}

export class UpdateClaim implements Action {
    public readonly type = ClaimActionTypes.UPDATE_CLAIM;
    constructor(public readonly payload: ClaimModel) { }
}

export type ClaimActions = ChangeState | AddClaim | UpdateClaim;

