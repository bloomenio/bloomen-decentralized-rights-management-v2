import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserContract } from '@core/core.module.js';
import { Inject } from '@angular/core';
import { Web3Service } from '@services/web3/web3.service';

export class UserManagementDataSource implements DataSource<UserModel> {

    private users$ = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(
        @Inject(UserContract) private userContract
    ) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.users$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.users$.complete();
        this.loadingSubject.complete();
    }

    public loadUsers(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        // Remove mock and do the request paginated
        this.loadingSubject.next(true);
        this.userContract.getUsersByMember(pageIndex).then((users) => {
            this.users$.next(users);
            this.loadingSubject.next(false);
        });
    }
}
