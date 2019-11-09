// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { Subscription, interval, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { skipWhile, takeWhile, map, switchMap, first } from 'rxjs/operators';
import { THEMES } from '@core/constants/themes.constants';


import * as fromMemberSelectors from '@stores/member/member.selectors';
import * as fromUserSelectors from '@stores/user/user.selectors';
import * as fromUserActions from '@stores/user/user.actions';
import * as fromMemberActions from '@stores/member/member.actions';
import * as fromAppActions from '@stores/application-data/application-data.actions';
import * as fromClaimActions from '@stores/claim/claim.actions';

import { MemberModel } from '@core/models/member.model';
import { UserContract, ClaimsContract } from '@core/core.module';
import { INBOX } from '@core/constants/inbox.constants';
import { UserModel } from '@core/models/user.model';
import { ROLES } from '@core/constants/roles.constants';


const log = new Logger('inbox.component');

@Component({
  selector: 'blo-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {

  private member$: Subscription;
  // private intervalUser$: Subscription;
  // private intervalSuperUser$: Subscription;
  private user$: Subscription;

  public member: MemberModel;
  public user: UserModel;

  public inbox: any[];
  public message: any;


  constructor(
    private store: Store<any>,
    public snackBar: MatSnackBar,
    public router: Router,
    public claimsContract: ClaimsContract,
    public userContract: UserContract
  ) { }

  public ngOnInit() {

    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).pipe(
      skipWhile((member) => !member),
    ).subscribe((member) => {
      if (member) {
        if (!this.member || (this.member && member.memberId !== this.member.memberId)) {
          this.store.dispatch(new fromAppActions.ChangeTheme({ theme: THEMES[member.theme] }));
        }
        this.member = member;
        this.fillInbox();
      }
    });


    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
      skipWhile(user => !user),
      first()
    ).subscribe((user) => {
      this.user = user;
      if (user.role === ROLES.SUPER_USER) {
        this.fillInboxSuperUser();
      }
    });

    // this.intervalUser$ = interval(1500).pipe(
    //   switchMap(() => this.store.select(fromUserSelectors.getUser)),
    //   skipWhile((user) => !user),
    //   takeWhile((user) => user && (user.role === ROLES.ADMIN || user.role === ROLES.USER))
    // ).subscribe(() => {
    //   this.store.dispatch(new fromMemberActions.InitMember());
    // });

    // this.intervalSuperUser$ = interval(1500).pipe(
    //   switchMap(() => this.store.select(fromUserSelectors.getUser)),
    //   skipWhile((user) => !user),
    //   takeWhile((user) => user && user.role === ROLES.SUPER_USER)
    // ).subscribe(() => {
    //   this.fillInboxSuperUser();
    // });

  }

  public ngOnDestroy() {
    this.member$.unsubscribe();
    // this.intervalSuperUser$.unsubscribe();
    // this.intervalUser$.unsubscribe();
    this.user$.unsubscribe();
  }

  public onAcceptEvent(event) {
    if (this.message.type === INBOX.TYPES.USER) {
      this.store.dispatch(new fromUserActions.AcceptUser(event));
    } else {
      this.store.dispatch(new fromClaimActions.ChangeState(event));
      if (this.message.type === INBOX.TYPES.CLAIM && this.message.memberReceptor === this.message.memberOwner) {
        this.message = undefined;
      }
    }
  }

  public onRejectEvent(event) {
    this.store.dispatch(new fromUserActions.RejectUser(event));
  }

  public onMessageSelected(event) {
    this.message = { ...event };
  }

  private refreshInbox() {
    console.log('Works!');

    if (this.user.role === ROLES.SUPER_USER) {
      this.fillInboxSuperUser();
    } else {
      this.store.dispatch(new fromMemberActions.InitMember());
    }
  }

  private async fillInboxSuperUser() {
    console.log('this is fillInboxSuperUser');
    const userArray: any[] = await from(this.userContract.getUsersOwner()).pipe(
      map((users) => {
        return users.filter((user) => INBOX.STATUS[user.status] === INBOX.STATUS[1] && user.role === ROLES.ADMIN);
      })
    ).toPromise();

    const usersArray = [];
    for (let i = 0; i < userArray.length; ++i) {
      userArray[i].type = INBOX.TYPES.USER;
      usersArray.push(userArray[i]);
    }

    this.inbox = [...usersArray];

    this.clearMessage();
  }

  private async fillInbox() {
    const claimsArray = [];
    const usersArray = [];

    for (let i = 0; i < this.member.claimInbox.length; ++i) {
      const claim = await this.claimsContract.getClaimById(this.member.claimInbox[i]);
      claim.type = INBOX.TYPES.CLAIM;

      const messages = [];
      claim.messageLog.forEach(element => {
        messages.push(JSON.parse(element));
      });
      claim.messageLog = messages;
      // if (claim. == INBOX.STATUS_CLAIM)
      claimsArray.push(claim);
    }
    if (this.user && this.user.role === ROLES.ADMIN) {
      for (let i = 0; i < this.member.userRequests.length; ++i) {
        const user = await this.userContract.getUserByAddress(this.member.userRequests[i]);
        user.type = INBOX.TYPES.USER;
        usersArray.push(user);
      }
    }

    this.inbox = [...claimsArray, ...usersArray].sort((a, b) => {
      if (a.type === INBOX.TYPES.CLAIM && b.type === INBOX.TYPES.CLAIM) {
        return b.lastChange - a.lastChange;
      }
      if (a.type === INBOX.TYPES.CLAIM && b.type === INBOX.TYPES.USER) {
        return b.creationDate - a.lastChange;
      }
      if (a.type === INBOX.TYPES.USER && b.type === INBOX.TYPES.CLAIM) {
        return b.lastChange - a.creationDate;
      }
      return b.creationDate - a.creationDate;
    });

    this.clearMessage();
  }

  private clearMessage() {
    if (this.message) {
      const isDeletedMessageSelected = !this.inbox.find((message) => message.creationDate === this.message.creationDate);
      if (isDeletedMessageSelected) {
        this.message = undefined;
      }
    }
  }
}
