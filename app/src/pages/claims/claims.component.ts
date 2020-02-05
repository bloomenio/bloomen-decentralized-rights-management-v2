// Basic
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
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
import {InboxComponent, unreadMessages} from '@pages/inbox/inbox.component';
import * as fromMemberActions from '@stores/member/member.actions';
import {ShellComponent} from '@shell/shell.component';
import {DeleteClaimComponent} from '@components/delete-claim/delete-claim.component';

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

    private members: MemberModel[];
    private members$: Subscription;

    public claimType: any;


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

    public ngOnInit() {

        this.members$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe(members => {
            this.members = members;
        });

        this.displayedColumns = ['type', 'code', 'title', 'status', 'creationDate', 'edit', 'view']; // , 'delete'];
        this.dataSource = new ClaimsDataSource(this.claimsContract);
        this.dataSource.loadClaims();
        this.claimType = ClaimModel.ClaimTypeEnum;

        // this.newMessagesInterval$ = interval(5000).subscribe(() => {
        // FOR "NEW MESSAGES" INBOX NOTIFICATION.
        // tslint:disable-next-line:no-life-cycle-call
        this.inboxComponent.ngOnInit();
        if (!this.shellComponent.newMessagesGet()) {
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
            this.dataSource.loadClaims(
                '',
                'asc',
                this.paginator.pageIndex,
                this.paginator.pageSize
            );
        }
        // if (this.shellComponent.newMessagesGet()) {
        //     console.log('You have new CONFLICT messages.');
        // }
    }

    public clickEdit(element, isEdit) {
        let dialog;

        switch (element.claimType) {
            case false:
                dialog = this.dialog.open(MusicalDialogComponent, {
                    data: {
                        claim: element,
                        members: this.members,
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
                });
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
