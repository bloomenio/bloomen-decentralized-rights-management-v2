// Basic
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { MatSnackBar, MatPaginator, MatSort } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { MemberManagementDataSource } from './member-management.datasource';
import { tap, map, skipWhile } from 'rxjs/operators';
import { MemberContract } from '@core/core.module';
import { Store } from '@ngrx/store';

import * as fromMemberSelector from '@stores/member/member.selectors';
import * as fromMemberActions from '@stores/member/member.actions';
import {interval, Subscription} from 'rxjs';
import {InboxComponent} from '@pages/inbox/inbox.component';
import {ShellComponent} from '@shell/shell.component';
import {DialogMemberDataComponent} from '@components/dialog-member-data/dialog-member-data.component';
import * as fromUserActions from '@stores/user/user.actions';
import {MatDialog} from '@angular/material/dialog';

const log = new Logger('company-management.component');

/**
 * Member management page
 */
@Component({
  selector: 'blo-member-management',
  templateUrl: './member-management.component.html',
  styleUrls: ['./member-management.component.scss']
})
export class MemberManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  public newMessagesInterval$: any;
  public displayedColumns: string[];
  public dataSource: MemberManagementDataSource;

  public member$: Subscription;
  // public dialogMemberDataComponent: DialogMemberDataComponent;

  public companiesPageNumber: number;

  @ViewChild(MatPaginator) public paginator: MatPaginator;
  @ViewChild(MatSort) public sort: MatSort;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    private memberContract: MemberContract,
    private store: Store<any>,
    // public dialogMemberDataComponent: DialogMemberDataComponent,
    public dialog: MatDialog,
    public inboxComponent: InboxComponent,
    public shellComponent: ShellComponent
  ) { }

  public ngOnInit() {
    this.displayedColumns = ['companyName', 'image', 'cmo', 'country', 'creationDate', 'collection', 'edit'];
    this.dataSource = new MemberManagementDataSource(this.memberContract);

    this.member$ = this.store.select(fromMemberSelector.selectAllMembers).pipe(
      skipWhile((members) => !members)
    ).subscribe(() => {
      this.dataSource.loadCompanies();
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
  }

  public ngAfterViewInit() {

    // Simulate get number of items from the server
    this.memberContract.getCountMembers().then((count) => {
      this.companiesPageNumber = count;
    });

    this.paginator.page.pipe(
      tap(() => this.loadUsersPage())
    ).subscribe();
  }

  public loadUsersPage() {
    this.dataSource.loadCompanies(
      '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  public clickEdit(element) {
    const dialogRef = this.dialog.open(DialogMemberDataComponent, {
      data: { member: element }
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        // console.log('VALUE for UpdateMember: ', value);
        this.store.dispatch(new fromMemberActions.UpdateMember(value));
      }
    });
  }

  public ngOnDestroy() {
    this.member$.unsubscribe();
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
  }
}
