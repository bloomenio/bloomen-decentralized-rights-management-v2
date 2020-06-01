import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as fromActions from './repertoire.actions';
import { Logger } from '@services/logger/logger.service';
import { AssetsApiService } from '@api/assets-api.service';
import {BehaviorSubject, Observable, of} from 'rxjs';

const log = new Logger('application-data.effects');

export let globalAllAssets: any;
export let collections: any;
// export let loading$: Observable<boolean>;

@Injectable()
export class RepertoireEffects {

    constructor(
        private actions$: Actions<fromActions.RepertoireActions>,
        private repertoireApiService: AssetsApiService
    ) { }

    private loadingSubject = new BehaviorSubject<boolean>(true);
    public loading$ = this.loadingSubject.asObservable();
    public globalAllAssetsVariable: any;

    @Effect() public countRepertoireGroups = this.actions$.pipe(
        ofType(fromActions.RepertoireActionTypes.COUNT_REPERTOIRE_GROUPS)
    ).pipe(
        switchMap(() => {
            return this.repertoireApiService.getGroups().pipe(
                map(groupList => {
                    // console.log('EFFECTS from getGroups: ');
                    // console.log(groupList);
                    collections = groupList;
                    return new fromActions.CountRepertoireGroupsSuccess(groupList);
                }),
                catchError(
                    switchMap(error => {
                        log.error(error);
                        return of(error);
                    })
                )
            );
        })
    );

    @Effect() public searchRepertoireList = this.actions$.pipe(
        ofType(fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_LIST)
    ).pipe(
        switchMap((action) => {
            // loading = true;
            this.loadingSubject.next(true);
            // console.log('effects loading = ', true);
            return this.repertoireApiService.getAssets(action.payload.filter, action.payload.pageIndex, action.payload.pageSize)
                .pipe(
                    map(assets => {
                        // console.log('EFFECTS from getAssets: ');
                        const allAssets = [];
                        for (let j = 0; j < assets.length; j++) {
                            for (let i = 0; i < assets[j].length; i++) {
                                allAssets.push(assets[j][i]);
                            }
                        }
                        // console.log(allAssets);
                        globalAllAssets = allAssets;
                        this.globalAllAssetsVariable = allAssets;
                        // loading = false;
                        // console.log('effects loading = ', false);
                        this.loadingSubject.next(false);
                        return new fromActions.RepertoireSearchSuccess(allAssets);
                   }),
                    catchError(
                    switchMap(error => {
                        log.error(error);
                        return of(error);
                    }))
                );
        })
    );

    // public setLoading(value): void {
    //     console.log(loading);
    //     this.loadingSubject.next(value);
    // }

    // public getLoading(): Observable<boolean> {
    //     return this.loadingSubject.asObservable();
    // }

    @Effect() public countRepertoireList = this.actions$.pipe(
        ofType(fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT)
    ).pipe(
        switchMap((action) => {
            // Repertoire DB
            // must be fromActions.RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT
            return this.repertoireApiService.getAssetsCount(action.payload.filter).pipe(
            // map(count => new fromActions.RepertoireSearchCountSuccess(count)),
            map(assets => {
                // console.log('EFFECTS from getAssetsCount: ');
                const allAssets = [];
                for (let j = 0; j < assets.length; j++) {
                    for (let i = 0; i < assets[j].length; i++) {
                        allAssets.push(assets[j][i]);
                    }
                }
                // console.log(allAssets);
                return new fromActions.RepertoireSearchCountSuccess(allAssets.length);
            }),
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





