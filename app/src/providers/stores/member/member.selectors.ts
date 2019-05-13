
import { createFeatureSelector, createSelector } from '@ngrx/store';

// Reducer
import * as fromReducer from './member.reducer';


export const MemberState = createFeatureSelector<fromReducer.MemberState>('members');

export const { selectAll: selectAllMembers, selectIds } = fromReducer.memberAdapter.getSelectors(MemberState);

export const getCurrentMember = createSelector(MemberState, fromReducer.getCurrentMember);
