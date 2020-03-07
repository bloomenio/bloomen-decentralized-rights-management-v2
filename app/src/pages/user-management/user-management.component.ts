// Basic
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { MatSnackBar, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';

import { UserManagementDataSource } from './user-management.datasource.js';
import { tap, skipWhile } from 'rxjs/operators';
import { DialogUserDataComponent } from '@components/dialog-user-data/dialog-user-data.component';
import { UserContract } from '@core/core.module.js';
import { Store } from '@ngrx/store';

import * as fromUserSelector from '@stores/user/user.selectors';
import * as fromMemberSelector from '@stores/member/member.selectors';
import * as fromUserActions from '@stores/user/user.actions';


import {interval, Subscription} from 'rxjs';
import { MemberModel } from '@core/models/member.model.js';
import {InboxComponent, unreadMessages} from '@pages/inbox/inbox.component';
import {ShellComponent} from '@shell/shell.component';
import {UserModel} from '@models/user.model';
import {APPLICATION_DATA_CONSTANTS} from '@constants/application-data.constants';
import * as fromMemberActions from '@stores/member/member.actions';
import {ApplicationDataDatabaseService} from '@db/application-data-database.service';

const log = new Logger('user-management.component');


/**
 * User management page
 */
@Component({
  selector: 'blo-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  public newMessagesInterval$: any;
  public displayedColumns: string[];
  public dataSource: UserManagementDataSource;

  public user$: Subscription;
  public member$: Subscription;

  public member: MemberModel;

  public usersPageNumber: number;
  public usedTokens: number;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public dialog: MatDialog,
    private userContract: UserContract,
    private applicationDatabaseService: ApplicationDataDatabaseService,
    private store: Store<any>,
    public inboxComponent: InboxComponent,
    public shellComponent: ShellComponent
  ) { }

  public async ngOnInit() {
    this.displayedColumns = ['name', 'id', 'member', 'role', 'creationDate', 'edit'];
    this.dataSource = new UserManagementDataSource(this.userContract);

    this.user$ = this.store.select(fromUserSelector.getUser).pipe(
        skipWhile((user) => !user)
    ).subscribe(() => {
      this.dataSource.loadUsers();
    });

    this.member$ = this.store.select(fromMemberSelector.getCurrentMember).subscribe((member) => {
      this.member = member;
    });

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
    this.shellComponent.unreadMessages = unreadMessages;
    this.router.navigate(['user-management']);

    await this.userContract.getUsedTokens(this.member.memberId).then((count) => {
      this.usedTokens = count;
    });
  }

  public ngAfterViewInit() {

    // Simulate get number of items from the server
    this.userContract.getUsersCountByMember().then((count) => {
      this.usersPageNumber = count;
    });

    this.paginator.page.pipe(
      tap(() => this.loadUsersPage())
    ).subscribe();
  }

  public loadUsersPage() {
    this.dataSource.loadUsers(
      '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  public clickEdit(element) {
    const dialogRef = this.dialog.open(DialogUserDataComponent, {
      data: {
        user: element,
        usedTokens: this.usedTokens,
        member: this.member
      }
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.store.dispatch(new fromUserActions.UpdateUser(value));
      }
    });
  }

  public async updateMemberAndUserInfo() {
    this.inboxComponent.store.dispatch(new fromMemberActions.InitMember()); // to update the member info
    await this.userContract.getUsedTokens(this.member.memberId).then((count) => {
      this.usedTokens = count;
    });
  }

  public ngOnDestroy() {
    this.user$.unsubscribe();
    this.member$.unsubscribe();
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
  }

}
