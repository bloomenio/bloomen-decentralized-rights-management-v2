import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { UserModel } from '@core/models/user.model';
import {BehaviorSubject, noop, Observable} from 'rxjs';
import { ClaimsContract } from '@core/core.module.js';
import { Inject } from '@angular/core';
import {MemberModel} from '@models/member.model';

export class ClaimsDataSource implements DataSource<UserModel> {

    public claims$ = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public cmo: string;
    public user: UserModel;
    public loading$ = this.loadingSubject.asObservable();
    public members: MemberModel[];
    public claims: any;
    public prevClaims: any;

    constructor(
        @Inject(ClaimsContract) private claimsContract
    ) { }

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        // console.log('CONNECT');
        return this.claims$.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer) {
        // console.log('DISCONNECT');
        this.claims$.complete();
        this.loadingSubject.complete();
    }

    public loadClaims(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        // Remove mock and do the request paginated
        // console.log('claims.dataSource.loadClaims()');
        // console.log('input: ', filter, sortDirection, pageIndex, pageSize);
        this.loadingSubject.next(true);
        this.claimsContract.getClaimsByMemId(pageIndex).then((claims) => {
        // this.claimsContract.getClaimById('1').then((claims) => {
        //     console.log('claims.datasource.claimsContract.getClaimsByMemId ');
        //     console.log('FROM DATASOURCE LOADCLAIMS');
            // SORT by title, then by creationDate.
            // claims = claims.sort((a, b) =>
            //     (a.claimData.ISRC || a.claimData.ISWC  < b.claimData.ISRC || b.claimData.ISWC ? -1 : 1));
            // claims = claims.sort((a, b) => (a[2][0][1] < b[2][0][1] ? -1 : 1));
            claims = claims.sort((a, b) => (a[2][0][1] === b[2][0][1]
                ? (a[6] - b[6]) : (a[2][0][1]  < b[2][0][1] ? -1 : 1)));
            // claims = claims.sort((a, b) => (a.claimData.ISRC || a.claimData.ISWC === b.claimData.ISRC || b.claimData.ISWC
            //     ? (a.creationDate - b.creationDate)
            //     : (a.claimData.ISRC || a.claimData.ISWC < b.claimData.ISRC || b.claimData.ISWC ? -1 : 1)));
            // claims.sort((a, b) => a.claimData.ISRC || a.claimData.ISWC < b.claimData.ISRC || b.claimData.ISWC
            //     ? -1 : a.claimData.ISRC || a.claimData.ISWC > b.claimData.ISRC || b.claimData.ISWC ? 1 : 0);
            this.prevClaims = this.claims;
            if (pageIndex === 0) {
                this.prevClaims = undefined;
            }
            this.claims = claims;
            // console.log(claims);
            // Group claims in order to showAsset() claim info only on first sequential appearance.
            let previous: any;
            let temp: any;
            if (claims.length) {
                temp = claims[0];
                previous = {
                    // claimData: {ISC: temp.claimData.ISRC || temp.claimData.ISWC, title: temp.claimData.title},
                    // claimType: temp.claimType};
                    claimData: {ISC: temp[2][0][1], title: temp.claimData.title},
                    claimType: temp[3]};
                // previous = temp;
                claims.splice(0, 0, previous);
                claims.join();
            }
            for (let c = 1; c < claims.length; c++) {
                const item = {
                    // claimData: {ISC: claims[c].claimData.ISRC || claims[c].claimData.ISWC, title: claims[c].claimData.title},
                    // claimType: claims[c].claimType};
                    claimData: {ISC: claims[c][2][0][1], title: claims[c].claimData.title},
                    claimType: claims[c][3]};
                if (item.claimData.ISC !== previous.claimData.ISC) {
                    claims.splice(c, 0, item);
                    claims.join();
                }
                previous = item;
            }

            // console.log(claims);
            // if (this.prevClaims) {
            // claims = this.prevClaims ? claims.concat(this.prevClaims) : claims;
            // this.claims = claims;
            // console.log('loadClaims()\npageIndex =', pageIndex, ' claims = ', claims, '\nprevClaims =', this.prevClaims);
            this.claims$.next(claims);
            this.loadingSubject.next(false);
        });
    }

    public loadClaimsFiltered(filter, sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
        // Remove mock and do the request paginated
        // console.log('claims.dataSource.loadClaims.getClaimByMemId');
        // console.log('input: ', filter, sortDirection, pageIndex, pageSize);
        this.loadingSubject.next(true);
        // this.claimsContract.getClaimsByMemIdFiltered(pageIndex, filter).then((claims) => {
        // // this.claimsContract.getClaimById('1').then((claims) => {
        // //     console.log('claims.datasource.claimsContract.getClaimsByMemId ');
        // //     console.log('FROM DATASOURCE LOADCLAIMS');
        //     // SORT by title, then by creationDate.
        //     claims = claims.sort((a, b) => (a.claimData.title  < b.claimData.title ? -1 : 1));
        //     claims = claims.sort((a, b) => (a.claimData.title === b.claimData.title
        //         ? (a.creationDate - b.creationDate)
        //         : (a.claimData.title < b.claimData.title ? -1 : 1)));
        //     // Group claims; view claim info on first sequential appearance.
        //     let previous: any;
        //     let temp: any;
        //     if (claims.length) {
        //         temp = claims[0];
        //         previous = {
        //             claimData: {ISC: temp.claimData.ISRC || temp.claimData.ISWC, title: temp.claimData.title},
        //             claimType: temp.claimType};
        //         // previous = temp;
        //         claims.splice(0, 0, previous);
        //         claims.join();
        //     }
        //     for (let c = 1; c < claims.length; c++) {
        //         const item = {
        //             claimData: {ISC: claims[c].claimData.ISRC || claims[c].claimData.ISWC, title: claims[c].claimData.title},
        //             claimType: claims[c].claimType};
        //         if (item.claimData.title !== previous.claimData.title) {
        //             claims.splice(c, 0, item);
        //             claims.join();
        //         }
        //         previous = item;
        //     }
        //     // console.log(claims);
        //     this.claims$.next(claims);
        //     this.loadingSubject.next(false);
        // });
    }

    // public loadSuperClaims(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 10) {
    //     console.log('DATASOURCE SUPERCLAIMS');
    //     console.log(this.members.filter((m) => m.cmo === this.cmo));
    //     console.log(this.cmo);
    //     this.members = this.members.filter((m) => m.cmo === this.cmo);
    //
    //     this.loadingSubject.next(true);
    //     this.claimsContract.getClaimsByMemId(pageIndex).then((claims) => {
    //     // this.claimsContract.getClaimById('1').then((claims) => {
    //     //     console.log('claims.datasource.claimsContract.getClaimsByMemId ');
    //         // console.log(claims);
    //         this.claims$.next(claims);
    //         this.loadingSubject.next(false);
    //     });
    // }
}
