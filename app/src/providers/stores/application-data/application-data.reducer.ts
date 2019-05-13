import { ApplicationDataStateModel } from '@models/application-data-state.model';
import { ApplicationDataActionTypes, ApplicationDataActions } from './application-data.actions';

export function applicationDataReducer(state: ApplicationDataStateModel, action: ApplicationDataActions): ApplicationDataStateModel {
    switch (action.type) {
        case ApplicationDataActionTypes.CHANGE_FIRST_RUN:
        case ApplicationDataActionTypes.CHANGE_THEME:
            return { ...{}, ...state, ...action.payload, };

        default:
            return state;
    }
}

export const getIsFirstRun = (state: ApplicationDataStateModel) => state ? state.isFirstRun : undefined;

export const getTheme = (state: ApplicationDataStateModel) => state ? state.theme : undefined;
