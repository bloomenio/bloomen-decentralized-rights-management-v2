import { CmosActions, CMOsActionTypes } from './cmos.actions';
import { CmosModel } from '@core/models/cmos.model';

const initialState: CmosModel = {
    cmos: []
};

export function cmosReducer(state: CmosModel = initialState, action: CmosActions): CmosModel {
    switch (action.type) {

        case CMOsActionTypes.INIT_CMOS_SUCCESS: {
            return { ...state, cmos: action.payload };
        }
        default:
            return state;
    }
}

export const getCmos = (state: CmosModel) => state.cmos;
