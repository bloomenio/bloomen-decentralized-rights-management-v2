import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of, merge } from 'rxjs';

// Store
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@stores/application-data/application-data.selectors';

// Constants
import { withLatestFrom, tap, map, switchMap, catchError } from 'rxjs/operators';

// Actions
import * as fromActions from './application-data.actions';
import { Logger } from '@services/logger/logger.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationDataStateModel } from '@core/models/application-data-state.model';
import { ApplicationDataDatabaseService } from '@db/application-data-database.service';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';
import { THEMES } from '@core/constants/themes.constants';

import { PreloadImages } from '@services/preload-images/preload-images.service';

const log = new Logger('application-data.effects');

@Injectable()
export class ApplicationDataEffects {

    constructor(
        private actions$: Actions<fromActions.ApplicationDataActions>,
        private overlayContainer: OverlayContainer,
        private store: Store<ApplicationDataStateModel>,
        private applicationDataDatabase: ApplicationDataDatabaseService,
        private preloadImages: PreloadImages
    ) { }

    @Effect({ dispatch: false }) public preloadImage = this.actions$.pipe(
        ofType(fromActions.ApplicationDataActionTypes.PRELOAD_IMAGE)
    ).pipe(
        map((img) => {
            this.preloadImages.preload(img.imatgePath);
        })
    );

    @Effect({ dispatch: false }) public persistFirstRun = this.actions$.pipe(
        ofType(fromActions.ApplicationDataActionTypes.CHANGE_FIRST_RUN),
        withLatestFrom(this.store.pipe(select(fromSelectors.getIsFirstRun))),
        tap(([action, isFirstRun]) => {
            this.applicationDataDatabase.set(APPLICATION_DATA_CONSTANTS.FIRST_RUN, isFirstRun);
        })
    );

    @Effect({ dispatch: false }) public persistTheme = this.actions$.pipe(
        ofType(fromActions.ApplicationDataActionTypes.CHANGE_THEME),
        withLatestFrom(this.store.pipe(select(fromSelectors.getTheme))),
        tap(([action, theme]) => {
            this.applicationDataDatabase.set(APPLICATION_DATA_CONSTANTS.THEME, theme);
        })
    );

    @Effect() public updateApplicationData = this.actions$.pipe(
        ofType(fromActions.ApplicationDataActionTypes.INIT_APP_DATA)
    ).pipe(
        switchMap(() => {
            const firstRun$ = this.applicationDataDatabase.get(APPLICATION_DATA_CONSTANTS.FIRST_RUN).pipe(
                map((value) => {
                    return {
                        type: APPLICATION_DATA_CONSTANTS.FIRST_RUN,
                        value
                    };
                })
            );
            const theme$ = this.applicationDataDatabase.get(APPLICATION_DATA_CONSTANTS.THEME).pipe(
                map((value) => {
                    return {
                        type: APPLICATION_DATA_CONSTANTS.THEME,
                        value
                    };
                })
            );
            return merge(firstRun$, theme$).pipe(
                map((element) => {
                    switch (element.type) {
                        case APPLICATION_DATA_CONSTANTS.FIRST_RUN: {
                            const isFirstRun = element.value || element.value === undefined;
                            return new fromActions.ChangeFirstRun({ isFirstRun });
                        }
                        case APPLICATION_DATA_CONSTANTS.THEME: {
                            const theme = element.value ? element.value : THEMES.blue;
                            return new fromActions.ChangeTheme({ theme });
                        }
                    }
                }),
                catchError((err) => {
                    log.error(`Error: ${err}`);
                    return of('ERROR');
                })
            );
        })
    );



    @Effect({ dispatch: false }) public updateTheme = merge(
        this.actions$.pipe(ofType(fromActions.ApplicationDataActionTypes.CHANGE_THEME))
    ).pipe(
        withLatestFrom(this.store.select(fromSelectors.getTheme)),
        tap(([action, effectiveTheme]) => {
            const classList = this.overlayContainer.getContainerElement().classList;
            const toRemove = Array.from(classList).filter((item: string) =>
                item.includes('-theme')
            );
            if (toRemove.length) {
                classList.remove(...toRemove);
            }
            classList.add(effectiveTheme);

        })
    );
}





