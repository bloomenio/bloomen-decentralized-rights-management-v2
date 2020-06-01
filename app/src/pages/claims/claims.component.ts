// Basic
import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input} from '@angular/core';
import { MatSnackBar, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { ClaimsDataSource } from './claims.datasource';
import { tap } from 'rxjs/operators';
import { MusicalDialogComponent } from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import { SoundDialogComponent } from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import { Store } from '@ngrx/store';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import { MemberModel } from '@core/models/member.model';
import {interval, Subscription} from 'rxjs';
import { ClaimModel } from '@core/models/claim.model';
import { ClaimsContract } from '@core/core.module';
import {InboxComponent, unreadMessages, currentUser, currentMember} from '@pages/inbox/inbox.component';
import * as fromMemberActions from '@stores/member/member.actions';
import {ShellComponent} from '@shell/shell.component';
import {DeleteClaimComponent} from '@components/delete-claim/delete-claim.component';
import { ROLES } from '@core/constants/roles.constants';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import {globalAllAssets} from '@core/core.module';
import {RepertoireEffects} from '@stores/repertoire/repertoire.effects';
import {AssetCardComponent} from '@components/asset-card/asset-card.component';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';
import {globalFetched} from '@components/inbox-item-list/inbox-item-list.component';

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


    @ViewChild(MatPaginator) public paginator: MatPaginator;
    @ViewChild(MatSort) public sort: MatSort;

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
        if (currentUser.role !== ROLES.SUPER_USER) {
            await this.claimsContract.getTransactionPrice().then(price => {
                this.price = Number(price);
                this.allowTransactionSubmissions = this.price <= currentUser.tokens;
                // console.log('AssetCardComponent says user tokens are ', this.user.tokens, ', transaction price is ', this.price,
                //     ' and allowTransactionSubmissions is ', this.allowTransactionSubmissions);
            });
        }
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

}
