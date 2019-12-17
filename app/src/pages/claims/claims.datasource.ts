import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { ClaimsContract } from '@core/core.module.js';
import { Inject } from '@angular/core';

export class ClaimsDataSource implements DataSource<UserModel> {

    private claims$ = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        @Inject(ClaimsContract) private claimsContract
    ) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.claims$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.claims$.complete();
        this.loadingSubject.complete();
    }

    public loadClaims(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        // Remove mock and do the request paginated
        // console.log('claims.datasource.loadClaims.getClaimByMemId');
        // console.log('input: ', filter, sortDirection, pageIndex, pageSize);
        this.loadingSubject.next(true);
        this.claimsContract.getClaimsByMemId(pageIndex).then((claims) => {
        // this.claimsContract.getClaimById('1').then((claims) => {
        //     console.log('claims.datasource.claimsContract.getClaimsByMemId ');
            // console.log(claims);
            this.claims$.next(claims);
            this.loadingSubject.next(false);
        });
    }
}
