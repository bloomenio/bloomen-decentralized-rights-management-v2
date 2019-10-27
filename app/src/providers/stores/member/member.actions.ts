import { Action } from '@ngrx/store';
import { MemberModel } from '@core/models/member.model';

export enum MemberActionTypes {
    INIT_MEMBER = '[member] init member',
    INIT_MEMBER_SUCCESS = '[member] init member success',
    SELECT_MEMBER = '[member] select member',
    UNSELECT_MEMBER = '[member] unselect member',
    ADD_MEMBER = '[member] add member',
    GET_MEMBERS = '[member] get members'
}

export class InitMember implements Action {
    public readonly type = MemberActionTypes.INIT_MEMBER;
}

export class InitMemberSuccess implements Action {
    public readonly type = MemberActionTypes.INIT_MEMBER_SUCCESS;
    constructor(public readonly payload: MemberModel[]) { }
}
export class SelectMember implements Action {
    public readonly type = MemberActionTypes.SELECT_MEMBER;
    constructor(public readonly payload: string) { }
}

export class UnselectMember implements Action {
    public readonly type = MemberActionTypes.UNSELECT_MEMBER;
}

export class AddMember implements Action {
    public readonly type = MemberActionTypes.ADD_MEMBER;
    constructor(public readonly payload: MemberModel) { }
}

export class GetMembers implements Action {
    public readonly type = MemberActionTypes.GET_MEMBERS;
    constructor(public readonly payload: MemberModel[]) { }
}

export type MemberActions = InitMember | InitMemberSuccess | SelectMember | UnselectMember | AddMember | GetMembers;
