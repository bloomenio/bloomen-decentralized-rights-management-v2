// Basic
import {Component, Inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MnemonicModel } from '@core/models/mnemonic.model';
import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromUserActions from '@stores/user/user.actions';
import * as fromMnemonicSelectors from '@stores/mnemonic/mnemonic.selectors';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';
import { ClipboardService } from 'ngx-clipboard';
import { THEMES } from '@core/constants/themes.constants';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {first, skipWhile} from 'rxjs/operators';
import {ROLES} from '@constants/roles.constants';
import {Subscription} from 'rxjs';
import {UserModel} from '@models/user.model';
import {MemberContract, UserContract} from '@services/web3/contracts';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import {MemberModel} from '@models/member.model';
import {MatDialog} from '@angular/material/dialog';
import {DialogSuperUserComponent} from '@components/dialog-super-user/dialog-super-user.component';
import {currentUser} from '@pages/inbox/inbox.component';
import {APPLICATION_DATA_CONSTANTS} from '@constants/application-data.constants';
import * as fromMemberActions from '@stores/member/member.actions';
import {ApplicationDataDatabaseService} from '@db/application-data-database.service';

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-user-profile-shell',
  templateUrl: 'user-profile-shell.component.html',
  styleUrls: ['user-profile-shell.component.scss']
})

export class UserProfileShellComponent implements OnInit {

  private mnemonic: string;
  private user$: Subscription;
  public user: UserModel;
  public roles: object;
  public members: MemberModel[];
  public member$: Subscription;
  public currentCMO: string;
  constructor(
    private router: Router,
    private store: Store<MnemonicModel>,
    private userStore: Store<UserModel>,
    public dialog: MatDialog,
    @Inject(MemberContract) private memberContract,
    public userContract: UserContract,
    private applicationDatabaseService: ApplicationDataDatabaseService,
    private clipboard: ClipboardService
  ) {

    this.store.select(fromMnemonicSelectors.getMnemonic).subscribe((mnemonic) => {
      this.mnemonic = mnemonic;
    });

    this.user$ = this.userStore.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      if (user) {
        this.user = user;
        if (user.role === ROLES.SUPER_USER) {
          // console.log(this.user);
        }
      }
    });

    this.member$ = this.store.select(fromMemberSelectors.selectAllMembers)
        // .pipe(      skipWhile((member) => !member))
        .subscribe((members) => {
          if (members) {
            this.members = members;
            // console.log('ALL MEMBERS:  ', this.members);
          }
        });
  }

  public ngOnInit() {

  }

  public async updateUserInfo() {
    const userBc = await this.userContract.getMe();
    const user: UserModel = {
      // creationDate: userBc.creationDate,
      firstName: userBc.firstName,
      lastName: userBc.lastName,
      role: userBc.role,
      requestId: userBc.requestId,
      status: userBc.status,
      memberId: userBc.memberId,
      owner: userBc.owner,
      cmo: userBc.cmo,
      groups: userBc.groups,
      tokens: userBc.tokens,
      kycData: userBc.kycData
    };
    // console.log('FROM RENEW USER GROUP RIGHTS: ');
    // console.log(user);
    this.applicationDatabaseService.set(APPLICATION_DATA_CONSTANTS.USER, user);
    // this.store.dispatch(new fromUserActions.AddUserSuccess(user));
    this.store.dispatch(new fromMemberActions.SelectMember(user.memberId));
    // @ts-ignore
    this.user = user;
  }

  /*
   * * * * * * * * * * * * *
   * ONLY FOR SUPER_USERs  *
   * * * * * * * * * * * * *
   */
  public doEdit() {       // input: this.user -> this.user.cmo -> change groups for all members of this cmo.
    // console.log('this.user.cmo is ', this.user.cmo);
    // console.log('this.user is ', this.user);
    // console.log('this.members is ', this.members);
    this.currentCMO = this.members.filter( (m) => m.cmo.toString() === this.user.cmo.toString() )[0].cmo;
    // console.log('currentCMO = ', this.currentCMO);
    // this.memberContract.getMembers(0, this.currentCMO).then((members) => { console.log('currentCMO\'s members', members); });

    const dialogRef = this.dialog.open(DialogSuperUserComponent, {
      data: { user: this.user },
      width: '600px',
      height: '500px'
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        // console.log('value');
        // console.log(value);
        this.store.dispatch(new fromUserActions.UpdateSuperUser(value));
      }
    });
  }

  public doLogout() {
    this.store.dispatch(new fromMnemonicActions.RemoveMnemonic());
    this.store.dispatch(new fromUserActions.RemoveUser());
    this.store.dispatch(new fromApplicationDataActions.ChangeTheme({ theme: THEMES.blue }));
    this.router.navigate(['login']);
  }

  public doCopyMnemonic() {
    this.clipboard.copyFromContent(this.mnemonic);
    // console.log('from UserProfileShellComponent user is: ');
    // console.log(this.user);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  public ngOnDestroy() {
    if (this.user$) {
      this.user$.unsubscribe();
    }
    if (this.member$) {
      this.member$.unsubscribe();
    }
  }

}
