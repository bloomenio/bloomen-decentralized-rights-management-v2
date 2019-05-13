import { UserModel } from '@core/models/user.model';
import { UserActions, UserActionTypes } from './user.actions';

export function userReducer(state: UserModel, action: UserActions): UserModel {
    switch (action.type) {

        case UserActionTypes.INIT_USER_SUCCESS:
        case UserActionTypes.ADD_USER_SUCCESS: {
            return { ...state, ...action.payload };
        }

        case UserActionTypes.REMOVE_USER_SUCCESS: {
            state = undefined;
            return state;
        }

        default:
            return state;
    }
}

export const getUser = (state: UserModel) => state;
