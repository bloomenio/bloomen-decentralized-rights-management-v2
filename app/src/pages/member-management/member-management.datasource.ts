import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

import companiesMock from '../../assets/mock/companies.json';
import { MemberContract } from '@core/core.module.js';
import { Inject } from '@angular/core';

export class MemberManagementDataSource implements DataSource<UserModel> {

    private users$ = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        @Inject(MemberContract) private memberContract
    ) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.users$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.users$.complete();
        this.loadingSubject.complete();
    }

    public loadCompanies(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        // Remove mock and do the request paginated
        this.loadingSubject.next(true);
        this.memberContract.getMembers(pageIndex).then((members) => {
            this.users$.next(members);
            this.loadingSubject.next(false);
        });
    }
}
