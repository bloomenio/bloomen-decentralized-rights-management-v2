import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import {Subscription, interval, from, Observable} from 'rxjs';
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
import {UserContract, ClaimsContract, FunctionsContract, globalAllAssets, MemberContract} from '@core/core.module';
import { INBOX } from '@core/constants/inbox.constants';
import { UserModel } from '@core/models/user.model';
import { ROLES } from '@core/constants/roles.constants';
import {ShellComponent} from '@shell/shell.component';
import * as fromRepertoireSelector from '@stores/repertoire/repertoire.selectors';
import {FormControl, FormGroup} from '@angular/forms';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import {AssetsApiService} from '@api/assets-api.service';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';
import {MatDialog} from '@angular/material/dialog';
import {RepertoireEffects} from '@stores/repertoire/repertoire.effects';

export let lastInboxLength: number;
export let inboxReadClaims: any; // claimId, lastChange, isRead
export let unreadMessages: any;
export let currentMember: any;
export let currentUser: any;

const log = new Logger('inbox.component');

@Component({
  selector: 'blo-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {

  private newMessagesInterval$: Subscription;
  private member$: Subscription;
  // private intervalUser$: Subscription;
  // private intervalSuperUser$: Subscription;
  private user$: Subscription;
  public user: UserModel;
  public userIsUndefined: any;
  public member: MemberModel;
  public inbox: any[];
  public message: any;
  public currentCMO: any;
  public currentMember: MemberModel;
  public allowTransactionSubmissions: boolean;
  public price: number;
  public timePassed: boolean;
  // public fetched: any;
  public repertoire$: Observable<any[]>;
  public repertoireCount$: Observable<number>;

  constructor(
    public store: Store<any>,
    public snackBar: MatSnackBar,
    public router: Router,
    public claimsContract: ClaimsContract,
    public functionsContract: FunctionsContract,
    public userContract: UserContract,
    public memberContract: MemberContract,
    public shellComponent: ShellComponent,
    public dialog: MatDialog,
    public assetsApiService: AssetsApiService,
    public repertoireEffects: RepertoireEffects
  ) { }

  public async ngOnInit() {
    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
      this.currentMember = member;
    });
    // console.log('INBOX COMPONENT CURRENT MEMBER group is ', this.currentMember.group);

    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).pipe(
        skipWhile((member) => !member),
    ).subscribe((member) => {
      if (member) {
        if (!this.member || (this.member && member.memberId !== this.member.memberId)) {
          this.store.dispatch(new fromAppActions.ChangeTheme({theme: THEMES[member.theme]}));
        }
        this.member = member;
        this.fillInbox();
      }
    });

    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      // if (user) {
      this.user = user;
      currentUser = user;
      if (user.role === ROLES.SUPER_USER) {
        this.fillInboxSuperUser();
        // console.log('fillInboxSuperUser');
        this.currentCMO = this.user.cmo;
        // console.log(currentUser);
        // console.log(this.member);
      }
      //  }
    });
    // this.store.dispatch(new fromUserActions.AddUser());   // in order to update groups from newly submitted from its Super User
    await this.store.dispatch(new fromRepertoireActions.CountRepertoireGroups());

    // To check if user tokens are enough to submit transactions.
    // if (currentUser.role !== ROLES.SUPER_USER) {
    //   await this.claimsContract.getTransactionPrice().then(price => {
    //     this.price = Number(price) + 99;
    //     this.allowTransactionSubmissions = this.price <= currentUser.tokens;
    //     console.log('currentUser.tokens');
    //     console.log(currentUser.tokens);
    //     console.log('this.price+99');
    //     console.log(this.price);
    //     console.log('allowTransactionSubmissions');
    //     console.log(this.allowTransactionSubmissions);
    //   });
    // }
    // this.allowTransactionSubmissions = this.shellComponent.allowTransactionSubmissions;
    // this.price = this.shellComponent.price;

    this.refreshInbox();
    if (unreadMessages === undefined) {
      unreadMessages = 0;
    }

  }

  public print() {

    currentMember = this.currentMember;
    // console.log('currentMember');
    // console.log(this.currentMember);
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
    // console.log('MESSAGE in onMessageSelected InboxComponent');
    // console.log(this.message);
    // console.log('read = ', this.message.read);
  }

  public refreshInbox() {
    // console.log('Works!');
    // console.log(this.user);

    if (this.user && this.user.role === ROLES.SUPER_USER) {
      this.fillInboxSuperUser();
    } else {
      this.store.dispatch(new fromMemberActions.InitMember());
    }
  }

  public async fillInboxSuperUser() {
    // console.log('this is fillInboxSuperUser');
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
    this.inbox = this.inbox.filter((m) => m.cmo === this.currentCMO);
    // console.log(this.inbox);

    this.clearMessage();
    if (this.inbox) {
      this.checkNewMessages();
    }
    // In order to load repertoire under the hood, when user has no messages.
    if (this.inbox === []) {
      await this.inboxIsEmptyLoadRepertoire();
    }
  }

  public async fillInbox() {
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

    // IN CASE CLAIMED CLAIMS ARE LEFT IN INBOX BY ACCIDENT.
    // for (let i = 0; i < this.inbox.length; i++) {
    //   console.log(this.inbox[i].status);
    //   if (!this.inbox[i].status) {
    //     this.inbox.splice(i, 1);
    //     this.inbox = this.inbox.splice(i, 1);
    //   }
    // }
    // 'delete claim' Garbage Collector
    if (this.inbox !== this.inbox.filter((m) => m.status)) {
      this.inbox = this.inbox.filter((m) => m.status);
      // await this.memberContract.updateClaimInbox(this.member, this.inbox);
    }
    if (this.inbox) {
      this.checkNewMessages();
    }
    // In order to load repertoire under the hood, when user has no messages.
    if (!this.inbox.length) {
      // console.log(this.inbox);
      await this.inboxIsEmptyLoadRepertoire();
    }
    // Remove duplicates from this.inbox
    this.inbox = Array.from(new Set(this.inbox.map(a => a.claimId)))
        .map(claimId => {
          return this.inbox.find(a => a.claimId === claimId);
        });
    // console.log('INBOX', this.inbox);
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

    this.timePassed = false;
    // this.unreadMessages = 0;
    // console.log(typeof lastInboxLength);
    if (lastInboxLength === undefined) {
    // if ((typeof lastInboxLength).toString() === 'undefined') {
      // console.log('lastInboxLength typeof: ' + typeof lastInboxLength);
      lastInboxLength = 0;
      // console.log('lastInboxLength  value: ' + lastInboxLength);
    }

    // NEW DEV
    // If 1st time, initialize.
    if (inboxReadClaims === undefined) {
      inboxReadClaims = [];
      for (let i = 0; i < this.inbox.length; ++i) {
        inboxReadClaims.push({creationDate: this.inbox[i].creationDate, string: this.inbox[i][1], read: false});
      }
      // console.log('INBOXREADCLAIMS');
      // console.log(inboxReadClaims);
    }

    // If one or more messages are removed.
    if (this.inbox.length < lastInboxLength) {
      let mm: any;
      for (let i = 0; i < inboxReadClaims.length; ++i) {
        const n = inboxReadClaims[i];
        let found = false;
        for (let j = 0; j < this.inbox.length; ++j) {
          const m = this.inbox[j];
          if (n.creationDate === m.creationDate && n.string === (m.claimId ? m.claimId : m.firstName) ) {
            // console.log('FOUND');
            // console.log(n);
            found = true;
            break;
          } else {
            mm = m;
          }
        }
        if (!found) {
          // console.log('TO DELETE');
          // console.log(mm);
          const toDel = inboxReadClaims.splice(i, 1);
          // console.log(toDel);
          // console.log('INBOXREADCLAIMS');
          // console.log(inboxReadClaims);
        }
      }
    }

    // If there are new messages.
    if (this.inbox.length > lastInboxLength) {
      for (let i = 0; i < this.inbox.length; ++i) {
        const m = this.inbox[i];
        let found = false;
        for (let j = 0; j < inboxReadClaims.length; ++j) {
          const n = inboxReadClaims[j];
          if (n.creationDate === m.creationDate && n.string === (m.claimId ? m.claimId : m.firstName) ) {
            // console.log('FOUND');
            // console.log(n);
            found = true;
            break;
          }
        }
        if (!found) { // && m.status !== '2') {
          // console.log('TO INSERT');
          // console.log(m);
          const toIns = inboxReadClaims.push({creationDate: this.inbox[i].creationDate, string: this.inbox[i][1], read: false});
          // console.log(toIns);
          // console.log('INBOXREADCLAIMS');
          // console.log(inboxReadClaims);
        }
      }
    }

    // Every time update this.inbox with current read/unread status.
    for (let i = 0; i < this.inbox.length; ++i) {
      const m = this.inbox[i];
      // console.log('m');
      // console.log((inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read);
      if (m && ( (inboxReadClaims !== undefined && inboxReadClaims.filter(x => m.creationDate ===
            x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string)[0] !== undefined) )) {
        m.read = (inboxReadClaims.filter((x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string))[0].read;
      }
    }
    inboxReadClaims = [];
    for (let i = 0; i < this.inbox.length; ++i) {
      inboxReadClaims.push({creationDate: this.inbox[i].creationDate, string: this.inbox[i][1], read: this.inbox[i].read });
    }
    unreadMessages = inboxReadClaims.filter((x) => !x.read).length;

    // Update lastInboxLength
    // if (this.member && this.inbox) {
    // console.log('this.inbox.length BEFORE: ' + this.inbox.length);
    // console.log('this.lastInboxLength BEFORE: ' + lastInboxLength);
    if (this.inbox.length !== lastInboxLength) {
      if (this.inbox.length > lastInboxLength) {
        // console.log('You have new CONFLICT messages.');
      }
    }
    unreadMessages = inboxReadClaims.filter((x) => !x.read).length;
    this.shellComponent.newMessagesSet(unreadMessages);
    lastInboxLength = this.inbox.length;
    // console.log('this.inbox.length AFTER: ' + this.inbox.length);
    // console.log('this.lastInboxLength AFTER: ' + lastInboxLength);
    // }
    // console.log('INBOXREADCLAIMS');
    // console.log(inboxReadClaims);
    //
    // // Print inbox.
    // console.log('member\'s inbox: ', this.inbox);
    // console.log('member\'s claimInbox: ', this.member.claimInbox);
    // console.log('member\'s claims: ', this.member.claims);
    // console.log('member\'s memberId: ', this.member.memberId);
    // console.log('member\'s name: ', this.member.name);
    this.timePassed = true;
  }

  public markAsRead(creationDate, string) {
    console.log('The message was just read.');
    for (let i = 0; i < this.inbox.length; ++i) {
      const m = this.inbox[i];
      if ((m.claimId ? m.claimId : m.firstName) === string && m.creationDate === creationDate) {
        (inboxReadClaims.filter( (x) => m.creationDate === x.creationDate && (m.claimId ? m.claimId : m.firstName) === x.string ))[0].read = true;
        m.read = true;
      }
    }
    unreadMessages = inboxReadClaims.filter((x) => !x.read).length;
    this.shellComponent.newMessagesSet(unreadMessages);
  }

  public isRead (message) {
    if (inboxReadClaims === undefined || inboxReadClaims.filter(x => message.creationDate ===
        x.creationDate && (message.claimId ? message.claimId : message.firstName) === x.string)[0] === undefined
    ) {
      return undefined;
    }
    return (inboxReadClaims
        .filter( (x) => message.creationDate === x.creationDate && (message.claimId ? message.claimId : message.firstName) === x.string ))[0].read;
  }

  public async inboxIsEmptyLoadRepertoire() {

    this.dialog.open(AssetCardReadOnlyComponent, {}); // only mat-spinner, when opened with config = {}
    this.assetsApiService.type = 'all';
    this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
    this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);
    this.assetsApiService.groups = this.user.groups;
    // console.log('this.assetsApiService.groups is ', this.assetsApiService.groups);
    this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
          filter: '',
          pageIndex: 0,
          pageSize: 300
        }
    ));
    while (this.repertoireEffects.globalAllAssetsVariable === undefined) {
      await new Promise((res) => {
        setTimeout(res, 1000);
      });
    }
    if (this.dialog.openDialogs) {
      this.dialog.closeAll();
    }
  }

  public updateInfo() {
    // this.shellComponent.renewUserRights().then(r => {});
  }
}
