import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserModel } from '@core/models/user.model';

import * as fromReducer from './user.reducer';


export const UserState = createFeatureSelector<UserModel>('user');

export const getUser = createSelector(UserState, fromReducer.getUser);
