import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromReducer from './cmos.reducer';
import { CmosModel } from '@core/models/cmos.model';


export const UserState = createFeatureSelector<CmosModel>('cmos');

export const getCmos = createSelector(UserState, fromReducer.getCmos);
