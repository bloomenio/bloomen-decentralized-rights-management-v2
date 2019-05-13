import { createFeatureSelector, createSelector } from '@ngrx/store';

// Reducer
import * as fromReducer from './repertoire.reducer';

export const repertoireState = createFeatureSelector<fromReducer.RepertoireState>('repertoire');

export const { selectAll: selectRepertoire, selectIds } = fromReducer.repertoireAdapter.getSelectors(repertoireState);

export const getRepertoireCount = createSelector(repertoireState, fromReducer.getRepertoireCount);
