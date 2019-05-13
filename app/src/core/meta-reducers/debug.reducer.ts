import { ActionReducer } from '@ngrx/store';

import { AppState } from '../core.state';
import { Logger } from '@services/logger/logger.service';

const logger = new Logger('debug.reducer');

export function debug(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return function(state, action) {
    const newState = reducer(state, action);
    logger.debug(`[DEBUG] action: ${action.type}`, {
      payload: (<any>action).payload,
      oldState: state,
      newState
    });
    return newState;
  };
}
