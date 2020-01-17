import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';

// Constants
import { map, switchMap, catchError } from 'rxjs/operators';

// Actions
import * as fromActions from './repertoire.actions';

import { Logger } from '@services/logger/logger.service';
import { AssetsApiService } from '@api/assets-api.service';
import { of } from 'rxjs';

const log = new Logger('application-data.effects');

@Injectable()
export class RepertoireEffects {

    constructor(
        private actions$: Actions<fromActions.RepertoireActions>,
        private repertoireApiService: AssetsApiService
    ) { }

    @Effect() public searchRepertoireList = this.actions$.pipe(
        ofType(fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_LIST)
    ).pipe(
        switchMap((action) => {
            return this.repertoireApiService.getAssets(action.payload.filter, action.payload.pageIndex, action.payload.pageSize)
                // .pipe( map((data) => {
                //     console.log('ASSETS:');
                //     console.log(data);
                // }))
                .pipe(
                map(assets => {
                    // console.log('EFFECTS: ');
                    // console.log(assets);
                    return new fromActions.RepertoireSearchSuccess(assets);
                }),
                catchError(
                    switchMap(error => {
                        log.error(error);
                        return of(error);
                    })
                )
            )
                ;
        })
    );

    @Effect() public countRepertoireList = this.actions$.pipe(
        ofType(fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT)
    ).pipe(
        switchMap((action) => {
            // Repertoire DB
            // must be fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT
            return this.repertoireApiService.getAssetsCount(action.payload.filter).pipe(
            map(count => new fromActions.RepertoireSearchCountSuccess(count)),
                catchError(
                    switchMap(error => {
                        log.error(error);
                        return of(error);
                    })
                )
            );
        })
    );
}





