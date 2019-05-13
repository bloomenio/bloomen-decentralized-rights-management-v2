import { ClaimActions } from './claim.actions';
import { ClaimModel } from '@core/models/claim.model';

export function claimReducer(state: ClaimModel, action: ClaimActions): ClaimModel {
    switch (action.type) {
        default:
            return state;
    }
}
