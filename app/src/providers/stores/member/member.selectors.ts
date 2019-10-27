
import { createFeatureSelector, createSelector } from '@ngrx/store';

// Reducer
import * as fromReducer from './member.reducer';
import {InitMemberSuccess} from '@stores/member/member.actions';


export const MemberState = createFeatureSelector<fromReducer.MemberState>('members');

export const { selectAll: selectAllMembers, selectIds } = fromReducer.memberAdapter.getSelectors(MemberState);

export const getCurrentMember = createSelector(MemberState, fromReducer.getCurrentMember);

// export const getMembers = createSelector(InitMemberSuccess, fromReducer.getMembers);
