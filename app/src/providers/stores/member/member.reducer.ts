import {InitMemberSuccess, MemberActions, MemberActionTypes} from './member.actions';
import { MemberModel } from '@core/models/member.model';

import { EntityState, createEntityAdapter } from '@ngrx/entity';

export interface MemberState extends EntityState<MemberModel> {
    currentMember: string;
}

// export interface InitMemberSuccess extends EntityState<MemberModel>[] {
//     members: ;
// }

export const memberAdapter = createEntityAdapter<MemberModel>({
    selectId: (member: MemberModel) => member.memberId
});

const memberInitialState: MemberState = memberAdapter.getInitialState({
    currentMember: undefined
});

export function memberReducer(state: MemberState = memberInitialState, action: MemberActions): MemberState {
    switch (action.type) {

        case MemberActionTypes.INIT_MEMBER_SUCCESS: {
            return memberAdapter.addAll(action.payload, state);
        }

        case MemberActionTypes.SELECT_MEMBER: {
            return { ...state, currentMember: action.payload };
        }

        case MemberActionTypes.UNSELECT_MEMBER: {
            return { ...state, currentMember: undefined };
        }

        default:
            return state;
    }
}

export const getCurrentMember = (state: MemberState) => state.entities[state.currentMember];

// export const getMembers = (state: InitMemberSuccess) => state.payload;
