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
import {AssetCardComponent} from '@components/asset-card/asset-card.component';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';

const log = new Logger('claims.component');

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
    // public allowTransactionSubmissions: boolean;
    // public price: number;


    @ViewChild(MatPaginator) public paginator: MatPaginator;
    @ViewChild(MatSort) public sort: MatSort;

    constructor(
        public snackBar: MatSnackBar,
        public router: Router,
        public dialog: MatDialog,
        public claimsContract: ClaimsContract,
        public store: Store<any>,
        public inboxComponent: InboxComponent,
        public shellComponent: ShellComponent
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

    public showAsset(element) {

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

    public ngOnDestroy() {
        this.members$.unsubscribe();
        if (this.newMessagesInterval$) {
            this.newMessagesInterval$.unsubscribe();
        }
    }

}
