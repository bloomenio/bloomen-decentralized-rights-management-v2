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

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public fb: FormBuilder,
    public store: Store<any>
  ) { }

  public ngOnInit() {
    this.userForm = this.fb.group({
      // firstName: ['', [Validators.required]],
      // lastName: ['', [Validators.required]],
      // cmo: ['', [Validators.required]],
      // member: ['', [Validators.required]],
      // role: ['', [Validators.required]]

      firstName: [''],
      lastName: [''],
      cmo: [''],
      member: [''],
      role: ['']
    });

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
        // const cmo = this.userForm.get('cmo').value; // onSubmit()
        const cmo = 'cmo1';                            // onSubmitAutoFill()
        if (!cmo) {
          return [];
        } else {
          return members.filter(member => {
            return member.cmo === cmo;
          });
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
    console.log('onSubmit membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
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
      console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    } else { // Opera
      const user: UserModel = {
        creationDate: new Date().getTime(),
        firstName: 'Cm',
        lastName: 'O1',
        memberId: this.membersFiltered[0].memberId.toString(),
        role: 'Admin'
      };
      console.log(user);
      this.store.dispatch(new fromUserActions.SendUser(user));
      this.router.navigate(['waiting-approve']);

      console.log('AutoFill_ended');
      console.log('AutoFill_1 membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
      console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
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
