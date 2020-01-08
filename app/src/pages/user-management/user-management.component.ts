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
import {InboxComponent} from "@pages/inbox/inbox.component";
import {ShellComponent} from "@shell/shell.component";

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

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public dialog: MatDialog,
    private userContract: UserContract,
    private store: Store<any>,
    public inboxComponent: InboxComponent,
    public shellComponent: ShellComponent
  ) { }

  public ngOnInit() {
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

    this.newMessagesInterval$ = interval(5000).subscribe(() => {
      // FOR "NEW MESSAGES" INBOX NOTIFICATION.
      // tslint:disable-next-line:no-life-cycle-call
      this.inboxComponent.ngOnInit();
      if (!this.shellComponent.newMessagesGet()) {
        this.inboxComponent.checkNewMessages();
      }
      // tslint:disable-next-line:no-life-cycle-call
      this.shellComponent.ngOnInit();
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
      data: { user: element }
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.store.dispatch(new fromUserActions.UpdateUser(value));
      }
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
