import { Action } from '@ngrx/store';
import { UserModel } from '@core/models/user.model';

export enum UserActionTypes {
    INIT_USER = '[User ] init user',
    INIT_USER_SUCCESS = '[User] init user success',
    ADD_USER = '[User] add user',
    ADD_USER_SUCCESS = '[User] add user success',
    REMOVE_USER = '[User] remove user',
    REMOVE_USER_SUCCESS = '[User] remove user success',
    SEND_USER = '[User] send user to blockchain',
    UPDATE_USER = '[User] update user',
    UPDATE_SUPERUSER = '[User] update super user',
    ACCEPT_USER = '[User] accept user',
    REJECT_USER = '[User] reject user',

}

export class InitUser implements Action {
    public readonly type = UserActionTypes.INIT_USER;
}

export class InitUserSuccess implements Action {
    public readonly type = UserActionTypes.INIT_USER_SUCCESS;
    constructor(public readonly payload: UserModel) { }
}

export class AddUser implements Action {
    public readonly type = UserActionTypes.ADD_USER;
}

export class AddUserSuccess implements Action {
    public readonly type = UserActionTypes.ADD_USER_SUCCESS;
    constructor(public readonly payload: UserModel) { }
}

export class RemoveUser implements Action {
    public readonly type = UserActionTypes.REMOVE_USER;
}

export class RemoveUserSuccess implements Action {
    public readonly type = UserActionTypes.REMOVE_USER_SUCCESS;
}

export class SendUser implements Action {
    public readonly type = UserActionTypes.SEND_USER;
    constructor(public readonly payload: UserModel) { }
}

export class UpdateUser implements Action {
    public readonly type = UserActionTypes.UPDATE_USER;
    constructor(public readonly payload: UserModel) { }
}

export class UpdateSuperUser implements Action {
    public readonly type = UserActionTypes.UPDATE_SUPERUSER;
    constructor(public readonly payload: UserModel) { }
}

export class AcceptUser implements Action {
    public readonly type = UserActionTypes.ACCEPT_USER;
    constructor(public readonly payload: string) { }
}
export class RejectUser implements Action {
    public readonly type = UserActionTypes.REJECT_USER;
    constructor(public readonly payload: string) { }
}

export type UserActions = InitUser | InitUserSuccess | AddUser | AddUserSuccess | RemoveUser | RemoveUserSuccess | SendUser | UpdateUser | AcceptUser
    | RejectUser;
