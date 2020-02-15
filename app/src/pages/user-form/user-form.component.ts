// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromUserActions from '@stores/user/user.actions';

import * as fromMemberSelectors from '@stores/member/member.selectors';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';

import { MemberModel } from '@core/models/member.model';
import { Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ROLES } from '@core/constants/roles.constants';
import { UserModel } from '@core/models/user.model';

const log = new Logger('user-form.component');


/**
 * User form page
 */
@Component({
  selector: 'blo-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {

  public userForm: FormGroup;
  private members: MemberModel[];
  public cmos: string[];
  public membersFiltered: MemberModel[];
  public roles: string[];

  public member$: Subscription;
  public cmos$: Subscription;

  public autoFill: boolean;
  public autoFillMultiCMO: boolean;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public fb: FormBuilder,
    public store: Store<any>
  ) { }

  public ngOnInit() {
    this.autoFillMultiCMO = false;
    this.autoFill = false;
    if (!this.autoFill) {
      this.userForm = this.fb.group({
        firstName: ['', [Validators.required]],      // onSubmit()
        lastName: ['', [Validators.required]],
        cmo: ['', [Validators.required]],
        member: ['', [Validators.required]],
        role: ['', [Validators.required]]
      });
    } else {
      this.userForm = this.fb.group({
        firstName: [''],                            // onSubmitAutoFill()
        lastName: [''],
        cmo: [''],
        member: [''],
        role: ['']
      });
    }

    this.member$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe((members) => {
      this.members = members;
    });

    this.cmos$ = this.store.select(fromCmosSelectors.getCmos).subscribe((cmos) => {
      this.cmos = cmos;
    });

    this.roles = [ROLES.USER, ROLES.ADMIN];
    console.log('ngOnInit member value is ' + this.userForm.get('member').value);
  }

  public onChange() {
    console.log('onChange_1 member value is ' + this.userForm.get('member').value);

    of(this.members).pipe(
      map((members) => {
        let cmo = this.userForm.get('cmo').value; // onSubmit()
        if (this.autoFill) {
          cmo = 'cmo1';                            // onSubmitAutoFill()
        }
        if (!cmo) {
          return [];
        } else {
          return members.filter(member => member.cmo === cmo );
        }
      })
    ).toPromise().then((members) => {
      this.membersFiltered = members;
      this.userForm.get('member').setValue(undefined);
    });
    console.log('onChange_2 member value is ' + this.userForm.get('member').value);
  }

  public onSubmit() {
    console.log('onSubmit membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
    // console.log('onSubmit membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    console.log('onSubmit_1 member value is ' + this.userForm.get('member').value);
    const user: UserModel = {
      creationDate: new Date().getTime(),
      firstName: this.userForm.get('firstName').value,
      lastName: this.userForm.get('lastName').value,
      memberId: this.userForm.get('member').value,
      role: this.userForm.get('role').value
    };
    this.store.dispatch(new fromUserActions.SendUser(user));
    this.router.navigate(['waiting-approve']);
    console.log('onSubmit_2 member value is ' + this.userForm.get('member').value);

  }

  public autoMultiCMO(name: string) {
    let user;
    switch (name) {
      case 'Alex':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Alex',
          lastName: 'Psyhas',
          memberId: Number(1).toString(),   // CMO1's Id is 5, but we input memberId of a CMO1's member.
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Gonçal':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Gonçal',
          lastName: 'Calvo',
          memberId: Number(1).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Mirko':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Mirko',
          lastName: 'Lorenz',
          memberId: Number(2).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Amaryllis':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Amaryllis',
          lastName: 'Raouzaiou',
          memberId: Number(2).toString(),   // CMO2's Id is 6, but we input memberId of a CMO2's member.
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Jordi':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Jordi',
          lastName: 'Escudero',
          memberId: Number(3).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Daniel':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Daniel',
          lastName: 'Harris',
          memberId: Number(4).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      default:
        break;
    }
  }

  public onSubmitAutoFill() {
    // @ts-ignore
    const isFirefox = typeof InstallTrigger !== 'undefined';
    console.log(isFirefox);
    if (isFirefox) {
      const user: UserModel = {
        creationDate: new Date().getTime(),
        firstName: 'Gonçal',
        lastName: 'Calvo',
        memberId: this.membersFiltered[0].memberId.toString(),
        role: 'Admin'
      };
      console.log(user);
      this.store.dispatch(new fromUserActions.SendUser(user));
      this.router.navigate(['waiting-approve']);

      console.log('AutoFill_ended');
      console.log('AutoFill_1 membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
   // console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    } else { // Opera
      const user: UserModel = {
        creationDate: new Date().getTime(),
        firstName: 'Alex',
        lastName: 'Psyhas',
        memberId: this.membersFiltered[0].memberId.toString(),
        role: 'Admin'
      };
      console.log(user);
      this.store.dispatch(new fromUserActions.SendUser(user));
      this.router.navigate(['waiting-approve']);

      console.log('AutoFill_ended');
      console.log('AutoFill_1 membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
   // console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    }
  }

  public onCancel() {
    this.store.dispatch(new fromMnemonicActions.RemoveMnemonic());
    this.router.navigate(['login']);
  }

  public ngOnDestroy() {
    this.cmos$.unsubscribe();
    this.member$.unsubscribe();
  }


}
