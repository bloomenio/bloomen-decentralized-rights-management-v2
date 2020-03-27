import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {MemberContract, RegistryContract} from '@core/core.module.js';
import { Inject } from '@angular/core';
import {MemberModel} from '@models/member.model';
import {currentUser} from '@pages/inbox/inbox.component';

export let companiesPageNumber: number;

export class MemberManagementDataSource implements DataSource<UserModel> {

    private users$ = new BehaviorSubject<UserModel[]>([]);
    private memberCount = new BehaviorSubject<number>(10);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private cmos: string[];
    private currentMember: MemberModel;
    private allMembers: MemberModel[];
    private member$: Subscription;
    // public companiesPageNumber: number;

    constructor(
        @Inject(MemberContract) private memberContract,
        public companiesPN: number
) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.users$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.users$.complete();
        // this.memberCount.complete();
        this.loadingSubject.complete();
    }

    public async loadCompanies(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        this.loadingSubject.next(true);
        this.memberContract.getMembers(pageIndex, currentUser.cmo)
            .then((members) => {
                // console.log('MEMBERS FROM loadCompanies are ', members.length);
                // this.companiesPageNumber = members.length;
                this.users$.next(members);
                this.loadingSubject.next(false);
            });
    }

    public async loadCompanies2(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        this.loadingSubject.next(true);
        this.memberContract.getAllMembers()
            .then((members) => {
                // console.log('MEMBERS FROM loadCompanies2 are ', members);
                members = members.filter(m => m.cmo === currentUser.cmo);
                // pageIndex = page * pageSize
                // pageNumber = members.length/pageSize
                // this.memberCount.next(members.length);
                companiesPageNumber = members.length;
                this.companiesPN = members.length;
                this.allMembers = members;
                if (members.length > pageSize) {
                    console.log(pageIndex);
                    members = [];
                    for (let i = 0; i < pageSize - 1; i++) {
                        if (pageIndex * pageSize + i < this.companiesPN) {
                            members.push(this.allMembers[pageIndex * pageSize + i]);
                        }
                    }
                    // members = [members[pageIndex * pageSize + 0], members[pageIndex * pageSize + 1], members[pageIndex * pageSize + 2],
                    //            members[pageIndex * pageSize + 3], members[pageIndex * pageSize + 4], members[pageIndex * pageSize + 5],
                    //            members[pageIndex * pageSize + 6], members[pageIndex * pageSize + 7], members[pageIndex * pageSize + 8],
                    //            members[pageIndex * pageSize + 9]
                    // ];
                }
                this.users$.next(members);
                this.loadingSubject.next(false);
            });
    }
}
