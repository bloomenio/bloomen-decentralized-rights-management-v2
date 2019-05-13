import { RepertoireActionTypes, RepertoireActions } from './repertoire.actions';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

import { AssetModel } from '@core/models/assets.model';

export interface RepertoireState extends EntityState<AssetModel> {
    count: number;
}

export const repertoireAdapter = createEntityAdapter<AssetModel>({
    selectId: (asset: AssetModel) => asset.id
});

const repertoireInitialState: RepertoireState = repertoireAdapter.getInitialState({
    count: 0
});

export function repertoireReducer(state: RepertoireState = repertoireInitialState, action: RepertoireActions): RepertoireState {
    switch (action.type) {
        case RepertoireActionTypes.SEARCH_REPERTOIRE_LIST_SUCCESS: {
            return repertoireAdapter.addAll(action.payload, state);
        }
        case RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT_SUCCESS: {
            return { ...state, ...{ count: action.payload } };
        }
        case RepertoireActionTypes.REMOVE_CURRENT_REPERTOIRE_SEARCH: {
            const tmpState = repertoireAdapter.removeAll(state);
            return { ...tmpState, ...{ count: undefined } };
        }
        default:
            return state;
    }
}

export const getRepertoireCount = (state: RepertoireState) => state.count;
