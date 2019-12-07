// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { Subscription, interval, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { skipWhile, takeWhile, map, switchMap, first } from 'rxjs/operators';
import { THEMES } from '@core/constants/themes.constants';
// import {lastInboxLengthClaims} from 'typings.d';

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
import {ShellComponent} from '@shell/shell.component';
// import {getType} from '@angular/flex-layout/typings/extended/style/style-transforms';
// import {type} from "os";
export let lastInboxLengthClaims: number;

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

  public lastInboxLengthUsers = 0;
  // public lastInboxLengthClaims = 0;
  public lastInboxLengthUserRequests = 0;

  constructor(
    public store: Store<any>,
    public snackBar: MatSnackBar,
    public router: Router,
    public claimsContract: ClaimsContract,
    public userContract: UserContract,
    public shellComponent: ShellComponent
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

    this.refreshInbox();

    // console.log('Refreshed Inbox');
    // if (this.user.role === ROLES.SUPER_USER) {
    //   console.log('Refreshed Inbox ROLES>SUPER_USER');
    //   this.fillInboxSuperUser();
    // } else {
    //   console.log('Refreshed Inbox ROLES>ADMIN/USER');
    //   this.store.dispatch(new fromMemberActions.InitMember());
    // }
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
      if (this.message.type === INBOX.TYPES.CLAIM /* && this.message.memberReceptor === this.message.memberOwner */ ) {
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

  public refreshInbox() {
    console.log('Works!');

    if (/*this.user &&*/ this.user.role === ROLES.SUPER_USER) {
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
    console.log('this is fillInbox');
    const claimsArray = [];
    const usersArray = [];

    // // to exclude smart contract function getClaim()
    for (let i = 0; i < this.member.claimInbox.length; ++i) {
      const claim = await this.claimsContract.getClaimById(this.member.claimInbox[i]);
      claim.type = INBOX.TYPES.CLAIM;

      const messages = [];
      // claim.messageLog.forEach(element => {
      //   messages.push(JSON.parse(element));
      // });
      // claim.messageLog = messages;
      // if (claim. == INBOX.STATUS_CLAIM)
      claimsArray.push(claim);
    }
    // const clAr = await this.claimsContract.getClaimsByMemId(0);
    // console.log(clAr.length);
    // for (let i = 0; i < clAr.length; i++) {
    //   if (this.member.claimInbox.includes(clAr[i])) {
    //     clAr[i].type = INBOX.TYPES.CLAIM;
    //     claimsArray.push(clAr[i]);
    //   }
    // }

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

    // console.log('synthiki: ' + ((typeof lastInboxLengthClaims).toString() === 'undefined').toString());
    // console.log(typeof lastInboxLengthClaims);
    if ((typeof lastInboxLengthClaims).toString() === 'undefined') {
      console.log('lastInboxLengthClaims typeof: ' + typeof lastInboxLengthClaims);
      lastInboxLengthClaims = 0;
      console.log('lastInboxLengthClaims  value: ' + lastInboxLengthClaims);
    }
    if (this.member && this.member.claimInbox) {
      console.log('this.member.claimInbox.length is ' + this.member.claimInbox.length);
      console.log('this.lastInboxLengthClaims    is ' + lastInboxLengthClaims);
      if (this.member.claimInbox.length !== lastInboxLengthClaims) {
        if (this.member.claimInbox.length > lastInboxLengthClaims) {
          console.log('You have new CONFLICT messages.');
          this.shellComponent.newMessages = true;
        }
        lastInboxLengthClaims = this.member.claimInbox.length;
      }
    }
  }
}
