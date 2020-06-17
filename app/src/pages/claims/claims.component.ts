// Basic
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSnackBar, MatSort} from '@angular/material';
import {Logger} from '@services/logger/logger.service';
import {Router} from '@angular/router';
import {ClaimsDataSource} from './claims.datasource';
import {tap} from 'rxjs/operators';
import {MusicalDialogComponent} from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import {Store} from '@ngrx/store';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import {MemberModel} from '@core/models/member.model';
import {Subscription} from 'rxjs';
import {ClaimModel} from '@core/models/claim.model';
import {ClaimsContract, globalAllAssets} from '@core/core.module';
import {currentUser, InboxComponent, unreadMessages} from '@pages/inbox/inbox.component';
import * as fromMemberActions from '@stores/member/member.actions';
import {ShellComponent} from '@shell/shell.component';
import {ROLES} from '@core/constants/roles.constants';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import {RepertoireEffects} from '@stores/repertoire/repertoire.effects';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';
import {globalFetched} from '@components/inbox-item-list/inbox-item-list.component';
import {FormControl} from '@angular/forms';

const log = new Logger('claims.component');

export let globalFetchedInClaims: any;
export let tempUrlClaims: any;
/**
 * Claims page
 */
@Component({
    selector: 'blo-claims',
    templateUrl: './claims.component.html',
    styleUrls: ['./claims.component.scss']
})
export class ClaimsComponent implements OnInit, AfterViewInit, OnDestroy {

    public newMessagesInterval$: any;
    public displayedColumns: string[];
    public dataSource: ClaimsDataSource;
    public usersPageNumber: number;
    public roles: object = ROLES;
    public members: MemberModel[];
    private members$: Subscription;
    public claimType: any;
    public currentMember: MemberModel;
    public allowTransactionSubmissions: boolean;
    public price: number;
    public selection: any;
    public sF = new FormControl();
    public statusList = [{label: 'CONFLICT', value: true}, {label: 'CLAIMED', value: false}];
    private prevFilter = '';
    public statusFilter: any;
    public claimsFilter = [];
    public dataSourceClaims: any;
    private prevValue = '';
    private anyFilter: any;
    private filtered: any;
    public datesFilter: any;
    public cStatus = {conflict: false, claimed: false};

    @ViewChild(MatPaginator) public paginator: MatPaginator;
    @ViewChild(MatSort) public sort: MatSort;
    private filteredAny: any;
    private filteredStatus: any;

    constructor(
        public snackBar: MatSnackBar,
        public router: Router,
        public dialog: MatDialog,
        public claimsContract: ClaimsContract,
        public store: Store<any>,
        public inboxComponent: InboxComponent,
        public shellComponent: ShellComponent,
        public repertoireEffects: RepertoireEffects
    ) {
    }

    public async ngOnInit() {

        this.members$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe(members => {
            this.members = members;
        });
        if (currentUser === undefined) {
            this.router.navigate(['inbox']);
        }
        if (globalAllAssets === undefined) {
            // alert('Bloomen Decentralized Management App:\n\n\nPlease click your \'Repertoire Tab\'!\n\n' +
            //         'In order to fetch the appropriate information on assets.');
            Promise.resolve()
                .then(() => {
                    this.router.navigate(['repertoire']);
                })
            // .then(() => {
            //     this.router.navigate(['claims']);
            // })
            ;
        }
        if (currentUser.role === ROLES.SUPER_USER) {
            this.displayedColumns = ['type', 'code', 'title', 'status', 'creationDate', 'view'];
        } else {
            this.displayedColumns = ['type', 'code', 'title', 'status', 'creationDate', 'edit', 'view', 'delete'];
        }
        this.dataSource = new ClaimsDataSource(this.claimsContract);
        this.dataSource.cmo = this.members.filter((m) => m.cmo === currentUser.cmo)[0].cmo;
        this.dataSource.user = currentUser;
        this.dataSource.members = this.members;
        // if (currentUser.role === ROLES.SUPER_USER) {
        //     this.dataSource.loadSuperClaims();
        // } else {
        this.dataSource.loadClaims();
        // }
        this.claimType = ClaimModel.ClaimTypeEnum;
        tempUrlClaims = this.router.url;
        globalFetchedInClaims = globalFetched;
        // this.newMessagesInterval$ = interval(5000).subscribe(() => {
        // FOR "NEW MESSAGES" INBOX NOTIFICATION.
        // tslint:disable-next-line:no-life-cycle-call
        this.inboxComponent.ngOnInit();
        if (!this.shellComponent.newMessagesGet() && this.inboxComponent.inbox) {
            this.inboxComponent.checkNewMessages();
        }
        // tslint:disable-next-line:no-life-cycle-call
        this.shellComponent.ngOnInit();
        // });
        // console.log('claims.components.dataSource.loadClaims: ');
        // console.log(this.dataSource);
        // console.log('claims.components.dataSource: ');
        //     console.log('NAVIGATE BY URL!');
        // });
        // this.router.navigateByUrl('/claims').then( () => {
        //     console.log('NAVIGATE BY URL!');
        // });
        // this.router.navigateByUrl('/inbox', { skipLocationChange: true }).then(() => {
        this.shellComponent.unreadMessages = unreadMessages;
        // console.log('unreadMessages');
        // console.log(unreadMessages);
        this.router.navigate(['claims']);

        // this.allowTransactionSubmissions = this.inboxComponent.allowTransactionSubmissions;
        // this.price = this.inboxComponent.price;
        // console.log(this.members);

        // To check if user tokens are enough to submit transactions.
        // if (currentUser.role !== ROLES.SUPER_USER) {
        //     await this.claimsContract.getTransactionPrice().then(price => {
        //         this.price = Number(price);
        //         this.allowTransactionSubmissions = this.price <= currentUser.tokens;
        //         // console.log('AssetCardComponent says user tokens are ', this.user.tokens, ', transaction price is ', this.price,
        //         //     ' and allowTransactionSubmissions is ', this.allowTransactionSubmissions);
        //     });
        // }

        this.dataSourceClaims = this.dataSource.claims;
        this.dataSource.claims$.subscribe((claims) => {
            this.dataSourceClaims = claims;
            // console.log('this.dataSourceClaims: ', this.dataSourceClaims);
        });
    }

    public ngAfterViewInit() {

        // Simulate get number of items from the server
        this.claimsContract.getClaimsCountByMemId().then((count) => {
            this.usersPageNumber = count;
        });

        this.paginator.page.pipe(
            tap(() => this.loadClaimsPage())
        ).subscribe();
    }

    public loadClaimsPage() {
        if (this.dataSource) {    // for when inbox detail call its claimsComponent
            // if (currentUser.role === ROLES.SUPER_USER) {
            //     this.dataSource.loadSuperClaims(
            //         '',
            //         'asc',
            //         this.paginator.pageIndex,
            //         this.paginator.pageSize
            //     );
            // } else {
                this.dataSource.loadClaims(
                    '',
                    'asc',
                    this.paginator.pageIndex,
                    this.paginator.pageSize
                );
                this.dataSourceClaims = this.dataSource.claims;
                // console.log('this.dataSourceClaims: ', this.dataSourceClaims);
            // }
        }
        // if (this.shellComponent.newMessagesGet()) {
        //     console.log('You have new CONFLICT messages.');
        // }
    }

    public clickEdit(element, isEdit) {
        let dialog;

        // console.log(this.inboxComponent.currentMember, '\n', this.currentMember);
        // console.log(element);
        // console.log(this.members.filter(m => m.memberId === element.memberOwner));
        const currentMemberWhenSuperAdmin = this.members.filter(m => m.memberId === element.memberOwner)[0];
        switch (element.claimType) {
            case false:
                dialog = this.dialog.open(MusicalDialogComponent, {
                    data: {
                        claim: element,
                        members: this.members,
                        currentMember: this.inboxComponent.currentMember || this.currentMember || currentMemberWhenSuperAdmin,
                        disableMemberEdit: true,
                        isEditable: isEdit,
                        toDelete: false
                    },
                    width: '900px',
                    height: '500px'
                });
                break;
            case true:
                dialog = this.dialog.open(SoundDialogComponent, {
                    data: {
                        claim: element,
                        members: this.members,
                        currentMember: this.inboxComponent.currentMember || this.currentMember || currentMemberWhenSuperAdmin,
                        disableMemberEdit: true,
                        isEditable: isEdit,
                        toDelete: false
                    },
                    width: '900px',
                    height: '500px'
                });
                break;
            default:
                break;
        }

        dialog.afterClosed().subscribe(value => {
            if (value) {
                this.claimsContract.updateCl(value).then(() => {
                    this.loadClaimsPage();
                    this.inboxComponent.store.dispatch(new fromMemberActions.InitMember()); // to update the inbox
                });
            }
        });
    }

    public delClaim(element) {
        let dialog;

        switch (element.claimType) {
            case false:
                dialog = this.dialog.open(MusicalDialogComponent, {
                    data: {
                        claim: element,
                        members: this.members,
                        currentMember: this.inboxComponent.currentMember,
                        disableMemberEdit: true,
                        isEditable: false,
                        toDelete: true
                    },
                    width: '900px',
                    height: '500px'
                });
                break;
            case true:
                dialog = this.dialog.open(SoundDialogComponent, {
                    data: {
                        claim: element,
                        members: this.members,
                        currentMember: this.inboxComponent.currentMember,
                        disableMemberEdit: true,
                        isEditable: false,
                        toDelete: true
                    },
                    width: '900px',
                    height: '500px'
                });
                break;
            default:
                break;
        }

        dialog.afterClosed().subscribe(value => {
            if (value) {
                this.claimsContract.delClaim(value).then(() => {
                    this.loadClaimsPage();
                    this.inboxComponent.store.dispatch(new fromMemberActions.InitMember()); // to update the inbox
                    // tslint:disable-next-line:no-life-cycle-call
                    this.ngAfterViewInit();
                    // this.dataSource.loadClaims();
                    // tslint:disable-next-line:no-life-cycle-call
                    // this.ngOnInit().then();
                });
            }
        });
    }

    public showAssetOld(element) {

        Promise.resolve('DONE')
            .then(async () => {
                const temp = globalAllAssets;
                this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                        filter: element.claimData.ISC,
                        pageIndex: 0,
                        pageSize: 300
                    }
                ));
                // while (globalAllAssets.length === temp.length) {
                await new Promise( resolve => setTimeout(resolve, 1000) );
                // }
                // console.log(globalAllAssets);
            })
            .then(() => {
                if (globalAllAssets.length) {
                    const assetToShow = globalAllAssets
                        .filter((asset) => (asset.ISWC || asset.ISRC) === element.claimData.ISC);
                    console.log(assetToShow);
                    this.dialog.open(AssetCardReadOnlyComponent, {
                        data: {
                            asset: assetToShow[0],
                            members: this.members
                        },
                        width: '560px'
                    });
                } else {
                    console.log('CLAIMS COMPONENT SAYS globalAllAssets is ', globalAllAssets);
                }
            });
    }


    public showAsset(message: any) {
        // console.log('showAsset(): ', message);

        if (globalAllAssets === undefined) {
            alert('Information not loaded yet!\n\n' +
                'Please try now...');
        } else {
            let assetToShow;
            Promise.resolve('DONE')
                .then(async () => {
                    // console.log('fetched initially: ', globalFetchedInClaims);
                    // console.log('globalFetchedInClaims initially: ', globalFetchedInClaims);
                    if (globalFetchedInClaims && globalFetchedInClaims
                        .filter((asset) => (asset.ISWC || asset.ISRC || asset.ISC) === (message.claimData.ISC)).length > 0 ) {
                        assetToShow = globalFetchedInClaims.filter((asset) => (asset.ISWC || asset.ISRC || asset.ISC) ===
                            (message.claimData.ISC));
                        // console.log('fetched.filter', assetToShow);
                        this.dialog.open(AssetCardReadOnlyComponent, {});
                    } else {
                        this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                                filter: message.claimData.ISC,
                                pageIndex: 0,
                                pageSize: 10
                        }));
                        this.dialog.open(AssetCardReadOnlyComponent, {});
                        // const oldVariable = this.repertoireEffects.globalAllAssetsVariable;
                        // console.log('message.claimData.ISC: ', message.claimData.ISC);
                        while (this.repertoireEffects.globalAllAssetsVariable.length > 1) {
                            await new Promise((res) => {
                                // console.log('Variable: ', this.repertoireEffects.globalAllAssetsVariable);
                                setTimeout(res, 1000);
                                // console.log(this.dialog.openDialogs);
                            });
                            if (this.router.url !== tempUrlClaims) {
                                break; // break if navigate to different page
                            }
                        }
                        // console.log('tempUrlClaims', tempUrlClaims);
                        if (this.router.url === tempUrlClaims) {  // break if navigate to different page
                            assetToShow = this.repertoireEffects.globalAllAssetsVariable;
                            if (globalFetchedInClaims === undefined) {
                                // console.log('undefined fetched');
                                globalFetchedInClaims = new Object([]);
                            }
                            globalFetchedInClaims.push(this.repertoireEffects.globalAllAssetsVariable[0]);
                            // console.log('fetched: ', globalFetchedInClaims);
                            if (this.repertoireEffects.globalAllAssetsVariable.length <= 1) {
                                // Increase length; to stuck on "while + await new Promise" when questioning next 🔍🔍🔍🔍🔎"pageview" <mat-icon>.
                                this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                                        filter: '',
                                        pageIndex: 0,
                                        pageSize: 10
                                    }
                                ));
                            }
                        }
                        globalFetched.concat(globalFetchedInClaims); // ??
                        // console.log(globalFetched);
                    }
                })
                .then(() => {
                    // console.log('then() => Variable: ', this.repertoireEffects.globalAllAssetsVariable);
                    // console.log('assetToShow: ', assetToShow);
                    if (this.router.url === tempUrlClaims) {  // break if navigate to different page
                        if (this.dialog.openDialogs.length) {
                            this.dialog.closeAll();
                            this.dialog.open(AssetCardReadOnlyComponent, {
                                data: {
                                    asset: assetToShow[0],
                                    members: this.members
                                },
                                width: '560px'
                            });
                        }
                    }
                });
        }
    }

    public ngOnDestroy() {
        this.members$.unsubscribe();
        if (this.newMessagesInterval$) {
            this.newMessagesInterval$.unsubscribe();
        }
    }

    public searchStatusFilter(searchStatusFilter: string) {
        if (!searchStatusFilter.length || this.prevFilter.length > searchStatusFilter.length) {
            this.statusList = [{label: 'CONFLICT', value: true}, {label: 'CLAIMED', value: false}];
            this.statusFilter = [];
        }
        this.statusList = this.statusList
            .filter((s) => s.label.includes(searchStatusFilter.trim().toUpperCase()));
        this.prevFilter = searchStatusFilter;
    }

    public applyStatusFilter(statusFilter: any) {
        this.dataSource.claims = this.dataSourceClaims;
        if (this.anyFilter && this.anyFilter[0] !== '') {
            this.dataSource.claims = this.filteredAny;
        }
        if (statusFilter.value.length === 1) { // Either CLAIMED or CONFLICT.
            this.filteredStatus = this.dataSource.claims.filter((claim) => {
                if (claim.status === statusFilter.value[0] || claim.claimData.ISC) {
                    return claim;
                }
            });
            this.dataSource.claims = this.filterLabelsOrNot(this.filteredStatus);
        }
        this.statusFilter = statusFilter;
        // console.log(statusFilter);
        if (this.statusFilter && this.statusFilter.value && this.statusFilter.value.length !== 1 &&
            this.anyFilter && this.anyFilter[0] !== '') {
            this.applyAnythingFilter(this.anyFilter.toString());
        }
    }

    public applyAnythingFilter(anythingFilter: string) {
        const anyFilter = anythingFilter.trim().toLowerCase().split(' ');
        this.dataSource.claims = this.dataSourceClaims;
        if (this.statusFilter && this.statusFilter.value && this.statusFilter.value.length === 1) {
            this.dataSource.claims = this.filteredStatus;
        }
        this.anyFilter = anyFilter;
        // let askStatus = false;
        // if (this.anyFilter.includes('conflict') || this.anyFilter.includes('claimed')) {
        //     this.calcStatus(this.anyFilter);
            // askStatus = true;
        // }
        let asksDates = false;
        if (this.anyFilter.length >= 2 &&
            (this.anyFilter.includes('from') || this.anyFilter.includes('to') || this.anyFilter.includes('year'))) {
            this.calcDates(this.anyFilter);
            asksDates = true;
        }
        this.filteredAny = this.dataSource.claims.filter((claim) => {
            if (claim.claimData.ISC) {
                return claim;
            }
            // if (askStatus) {
            //     if (this.cStatus.conflict && claim.status === true) {
            //         to return
                // }
                // if (this.cStatus.claimed && claim.status === false) {
                //     to return
                // }
            // }
            if (asksDates) {
                // console.assert();
                const start = Number(claim.claimData.startDate);
                const end = Number(claim.claimData.endDate);
                console.log(
                    start >= this.datesFilter.from && end <= this.datesFilter.to, '\n',
                    start <= this.datesFilter.yearEnd && end >= this.datesFilter.year, '\n',
                    start >= this.datesFilter.year && end <= this.datesFilter.yearEnd);
                // console.log(
                //     start, ' >= ', this.datesFilter.from, ' && ', end, ' <= ', this.datesFilter.to, '\n',
                //     start, ' <= ', this.datesFilter.yearEnd, ' && ', end, ' >= ', this.datesFilter.year, '\n',
                //     start, ' >= ', this.datesFilter.year, ' && ', end, ' <= ', this.datesFilter.yearEnd, '\n');
                if (start >= this.datesFilter.from && end <= this.datesFilter.to ||
                    start <= this.datesFilter.yearEnd && end >= this.datesFilter.year ||
                    start >= this.datesFilter.year && end <= this.datesFilter.yearEnd) {
                    const claimStr = claim.toString().toLowerCase();
                    let count = 0;
                    for (let i = 0; i < this.anyFilter.length; i++) {
                        if (claimStr.includes(this.anyFilter[i])) {
                            count++;
                        }
                    }
                    if (count === this.anyFilter.length) { // if claim includes every word of the filter
                        return claim;
                    }
                }
            } else {
                const claimStr = claim.toString().toLowerCase();
                let count = 0;
                for (let i = 0; i < this.anyFilter.length; i++) {
                    if (claimStr.includes(this.anyFilter[i])) {
                        count++;
                    }
                }
                if (count === this.anyFilter.length) { // if claim includes every word of the filter
                    return claim;
                }
            }
        });
        this.dataSource.claims = this.filterLabelsOrNot(this.filteredAny);
        // console.log('anyFilter: ', this.anyFilter);
        // this.anyFilter = anyFilter;
        if (this.anyFilter && this.anyFilter[0] === '' && this.statusFilter) {
            this.applyStatusFilter(this.statusFilter);
        }
    }

    public filterLabelsOrNot(filtered: any): any {
        if (filtered && filtered.length) {
            const filterLabels = [];
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i].claimData.ISRC || filtered[i].claimData.ISWC ||
                    filtered[i].claimData.ISC && !filtered[i + 1].claimData.ISC) {
                    filterLabels.push(filtered[i]);
                }
            }
            if (filtered[filtered.length - 1].claimData.ISRC || filtered[filtered.length - 1].claimData.ISWC) {
                filterLabels.push(filtered[filtered.length - 1]);
            }
            return filterLabels;
        } else {
            return this.dataSourceClaims;
        }
    }

    public calcStatus(anyFilter: any) {
        const anyF = []; // to extract dates from this.anyFilter
        let i = 0;
        while (i < anyFilter.length) {
            if (anyFilter[i] !== 'conflict' && anyFilter[i] !== 'claimed') {
                anyF.push(anyFilter[i]);
            } else if (anyFilter[i] === 'conflict') {
                this.cStatus = { conflict: true, claimed: false};
            } else { // anyFilter[i] === 'claimed'
                this.cStatus = { conflict: false, claimed: true};
            }
            i++;
        }
        if (anyFilter.includes('conflict') && anyFilter.includes('claimed')) {
            this.cStatus = { conflict: true, claimed: true};
        }
        const fValue = {source: {},
                        value: anyFilter.toString().includes('conflict') && anyFilter.toString().includes('claimed') ? [true, false] :
                            (anyFilter.toString().includes('conflict') && !anyFilter.toString().includes('claimed') ? [true] :
                                (!anyFilter.toString().includes('conflict') && anyFilter.toString().includes('claimed') ? [false] : [])) };
        // console.log(fValue.value);
        this.applyStatusFilter(fValue);
        this.anyFilter = anyF;
    }

    public calcDates(anyFilter: any) {
        const ranges = { from: 0, to: 0, year: 0, yearEnd: 0};
        const anyF = []; // to extract dates from this.anyFilter
        let i = 0;
        while (anyFilter.length >= 2 && i < anyFilter.length) {
            if (anyFilter[i] === 'from') {
                ranges.from = new Date(anyFilter[i + 1]).getTime();
                i++;
            } else if (anyFilter[i] === 'to') {
                ranges.to = new Date(anyFilter[i + 1]).getTime();
                i++;
            } else if (anyFilter[i] === 'year') {
                // console.log(new Date(Number(claim.claimData.endDate)).getMonth() + 1, '/',
                //             new Date(Number(claim.claimData.endDate)).getDate(), '/',
                //             new Date(Number(claim.claimData.endDate)).getFullYear());
                console.log(anyFilter[i + 1]);
                // anyFilter[i + 1] = new Date('1 Jan' + anyFilter[i + 1]).getTime();
                ranges.year = new Date('1 Jan' + anyFilter[i + 1]).getTime();
                ranges.yearEnd = new Date('31 Dec' + anyFilter[i + 1]).getTime();
                console.log(ranges.year, ' until ', ranges.yearEnd);
                // ranges.push(anyFilter[i + 1]);
                i++;
                // console.log(new Date(anyFilter[i + 1]).getMonth() + 1, '/',
                //             new Date(anyFilter[i + 1]).getDate(), '/',
                //             new Date(anyFilter[i + 1]).getFullYear());
            } else {
                anyF.push(anyFilter[i]);
            }
            i++;
        }
        this.datesFilter = ranges;
        this.anyFilter = anyF;
    }

}
