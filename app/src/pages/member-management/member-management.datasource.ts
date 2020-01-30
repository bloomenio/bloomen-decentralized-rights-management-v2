import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {MemberContract, RegistryContract} from '@core/core.module.js';
import { Inject } from '@angular/core';
import {MemberModel} from '@models/member.model';

export class MemberManagementDataSource implements DataSource<UserModel> {

    private users$ = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private cmos: string[];
    private currentMember: MemberModel;
    private member$: Subscription;

    constructor(
        @Inject(MemberContract) private memberContract,
        @Inject(MemberContract) private currentCmo: any
) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.users$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        this.users$.complete();
        this.loadingSubject.complete();
    }

    public async loadCompanies(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {

        // this.cmos = await this.registryContract.getCMOs();
        // this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
        //     this.currentMember = member;
        // });
        // this.currentCmo = this.cmos.filter((cmo) => cmo === currentMember.cmo );
        // console.log('MEMBERS FROM loadCompanies');

        this.loadingSubject.next(true);
        this.memberContract.getMembers(pageIndex, this.currentCmo)
            .then((members) => {
                this.users$.next(members);
                this.loadingSubject.next(false);
            });
    }
}
