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
import { UserContract, ClaimsContract, FunctionsContract } from '@core/core.module';
import { INBOX } from '@core/constants/inbox.constants';
import { UserModel } from '@core/models/user.model';
import { ROLES } from '@core/constants/roles.constants';
import {ShellComponent} from '@shell/shell.component';
// import {getType} from '@angular/flex-layout/typings/extended/style/style-transforms';
// import {type} from "os";

export let lastInboxLengthClaims: number;
export let inboxReadClaims: any; // claimId, lastChange, isRead

const log = new Logger('inbox.component');

@Component({
  selector: 'blo-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {

  public newMessages: boolean;
  private newMessagesInterval$: Subscription;
  private member$: Subscription;
  // private intervalUser$: Subscription;
  // private intervalSuperUser$: Subscription;
  private user$: Subscription;
  public user: UserModel;

  public member: MemberModel;

  public inbox: any[];
  public message: any;
  public currentMember: MemberModel;

  public lastInboxLengthUsers = 0;
  public lastInboxLengthUserRequests = 0;

  constructor(
    public store: Store<any>,
    public snackBar: MatSnackBar,
    public router: Router,
    public claimsContract: ClaimsContract,
    public functionsContract: FunctionsContract,
    public userContract: UserContract,
    public shellComponent: ShellComponent
  ) { }

  public ngOnInit() {

    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
      this.currentMember = member;
    });
    // console.log('INBOX COMPONENT CURRENT MEMBER group is ', this.currentMember.group);

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
    //
    // this.newMessagesInterval$ = interval(5000).subscribe(() => {this.refreshInbox();});

    // console.log('Refreshed Inbox');
    // if (this.user.role === ROLES.SUPER_USER) {
    //   console.log('Refreshed Inbox ROLES>SUPER_USER');
    //   this.fillInboxSuperUser();
    // } else {
    //   console.log('Refreshed Inbox ROLES>ADMIN/USER');
    //   this.store.dispatch(new fromMemberActions.InitMember());message
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
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
  }

  public onAcceptEvent(event) {
    if (this.message.type === INBOX.TYPES.USER) {
      this.store.dispatch(new fromUserActions.AcceptUser(event));
      // for (let _i = 0; _i < 10000000; _i++) { }
      // this.refreshInbox();
      this.newMessagesInterval$ = interval(5000).subscribe(() => {this.refreshInbox(); });
    } else {
      this.store.dispatch(new fromClaimActions.ChangeState(event));
      if (this.message.type === INBOX.TYPES.CLAIM /* && this.message.memberReceptor === this.message.memberOwner */ ) {
        this.message = undefined;
      }
    }
  }

  public onRejectEvent(event) {
    this.store.dispatch(new fromUserActions.RejectUser(event));
    // for (var _i = 0; _i < 100; _i++) {this.refreshInbox();}
    this.newMessagesInterval$ = interval(5000).subscribe(() => {this.refreshInbox(); });
  }

  public onMessageSelected(event) {
    this.message = { ...event };
    console.log('MESSAGE in onMessageSelected InboxComponent');
    console.log(this.message);
    console.log(this.message.read);
  }

  public refreshInbox() {
    // console.log('Works!');
    // console.log(this.user);

    if (/*this.user &&*/ this.user.role === ROLES.SUPER_USER) {
      this.fillInboxSuperUser();
    } else {
      this.store.dispatch(new fromMemberActions.InitMember());
    }
  }

  public async fillInboxSuperUser() {
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
    // console.log('this is fillInbox');
    const claimsArray = [];
    const usersArray = [];

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
    this.checkNewMessages();
    // console.log('INBOX');
    // console.log(this.inbox);
  }

  public clearMessage() {
    if (this.message) {
      const isDeletedMessageSelected = !this.inbox.find((message) => message.creationDate === this.message.creationDate);
      if (isDeletedMessageSelected) {
        this.message = undefined;
      }
    }
  }

  public checkNewMessages() {

    this.newMessages = false;
    // console.log(typeof lastInboxLengthClaims);
    if ((typeof lastInboxLengthClaims).toString() === 'undefined') {
      // console.log('lastInboxLengthClaims typeof: ' + typeof lastInboxLengthClaims);
      lastInboxLengthClaims = 0;
      // console.log('lastInboxLengthClaims  value: ' + lastInboxLengthClaims);
    }
    if (this.member && this.inbox) {
      console.log('this.inbox.length is ' + this.inbox.length);
      console.log('this.lastInboxLengthClaims    is ' + lastInboxLengthClaims);
      if (this.inbox.length !== lastInboxLengthClaims) {
        if (this.inbox.length > lastInboxLengthClaims) {
          console.log('You have new CONFLICT messages.');
          // this.shellComponent.newMessages = true;
          this.shellComponent.newMessagesSetTrue(this.inbox.length - lastInboxLengthClaims);
          this.newMessages = true;
          lastInboxLengthClaims = this.inbox.length;
        }
      }
    }

    // NEW DEV
    // If 1st time, initialize.
    if (inboxReadClaims === undefined) {
      inboxReadClaims = [];
      for (let i = 0; i < this.inbox.length; ++i) {
        inboxReadClaims.push({creationDate: this.inbox[i].creationDate, string: this.inbox[i][1], read: false});
      }
    }
    // If there are new messages.
    if (this.newMessages) {
      for (let i = 0; i < this.inbox.length; ++i) {
        const m = this.inbox[i];
        console.log('CONDITION');
        console.log(inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ));
        if ( (inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string )) === [] ) {
          console.log('NEW MESSAGE!');
          console.log(inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ));
          inboxReadClaims.push({creationDate: this.inbox[i].creationDate, string: this.inbox[i][1], read: false});
        }
      }
    }
    console.log('INBOXREADCLAIMS');
    console.log(inboxReadClaims);
    // Every time match inbox with current read/unread status.
    for (let i = 0; i < this.inbox.length; ++i) {
      const m = this.inbox[i];
      // console.log('m');
      // console.log((inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read);
      m.read = (inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read;
    }
    // Print inbox.
    console.log('INBOX');
    console.log(this.inbox);

    // If one or more messages are removed.
    if (this.inbox.length < inboxReadClaims.length) {
      for (let i = 0; i < inboxReadClaims.length; ++i) {
        const n = inboxReadClaims[i];
        let found = false;
        for (let j = 0; j < this.inbox.length; ++j) {
          const m = this.inbox[j];
          if (n.creationDate === m && n.string === (m.claimId ? m.claimId : m.firstName) ) {
            found = true;
            break;
          }
        }
        if (!found) {
          console.log('TO DELETE');
          console.log(n);
          const toDel = inboxReadClaims.splice(i, 1);
          console.log(toDel);
          console.log('INBOXREADCLAIMS');
          console.log(inboxReadClaims);
        }
      }
    }
    console.log('INBOXREADCLAIMS');
    console.log(inboxReadClaims);
  }

  public markAsRead(creationDate, string) {
    console.log('The message was just read.');
    for (let i = 0; i < this.inbox.length; ++i) {
      const m = this.inbox[i];
      if ((m.claimId ? m.claimId : m.firstName) === string && m.creationDate === creationDate) {
        // console.log('m');
        // console.log((inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read);
        (inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read = true;
        m.read = true;
      }
    }
  }

}
