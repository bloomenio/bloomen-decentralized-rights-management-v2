import { createFeatureSelector, createSelector } from '@ngrx/store';

// Model
import { ApplicationDataStateModel } from '@core/models/application-data-state.model';

// Reducer
import * as fromReducer from './application-data.reducer';


export const getApplicationData = createFeatureSelector<ApplicationDataStateModel>('applicationData');

// isFirstRun
export const getIsFirstRun = createSelector(getApplicationData, fromReducer.getIsFirstRun);

// getTheme
export const getTheme = createSelector(getApplicationData, fromReducer.getTheme);
