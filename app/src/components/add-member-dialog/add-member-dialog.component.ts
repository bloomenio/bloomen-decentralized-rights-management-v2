import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';
import * as fromMemberAction from '@stores/member/member.actions';
import { Logger } from '@services/logger/logger.service';
import { MemberModel } from '@core/models/member.model';
import { COUNTRIES } from '@constants/countries.constants';
import {startWith, map, skipWhile, first} from 'rxjs/operators';
// import {collections} from '@core/core.module';
import {collections} from '@stores/repertoire/repertoire.effects';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {ROLES} from '@constants/roles.constants';
import {UserModel} from '@models/user.model';

const log = new Logger('add-member-dialog');

@Component({
  selector: 'blo-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss']
})
export class AddMemberDialogComponent implements OnInit {

  public memberForm: FormGroup;
  public userData: any;
  public currentCMO: string;
  public collections = collections;
  public cmos$: Observable<any>;
  private user$: Subscription;
  public user: UserModel;
  public filteredCountries: Observable<string[]>;
  public allCountries: any[];

  constructor(
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    private fb: FormBuilder,
    public store: Store<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  public ngOnInit() {
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      if (user) {
        this.user = user;
        this.currentCMO = this.user.cmo;
        // console.log('this.currentCMO is ', this.currentCMO);
        if (user.role === ROLES.SUPER_USER) {
          // console.log(this.user);
        }
      }
    });

    this.memberForm = this.fb.group({
      cmo: [this.currentCMO, [Validators.required]],
      member: ['', [Validators.required]],
      url: ['', [Validators.required]],
      country: ['', [Validators.required]],
      theme: ['', [Validators.required]]
      // group: ['', [Validators.required]]
    });

    this.memberForm.get('cmo').disable();
    this.filteredCountries = this.memberForm.get('country').valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.allCountries = COUNTRIES;
    // this.cmos$ = this.store.select(fromCmosSelectors.getCmos);
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onSubmit() {
    const member: MemberModel = {
      creationDate: new Date().getTime(),
      cmo: this.memberForm.get('cmo').value,
      country: this.memberForm.get('country').value,
      name: this.memberForm.get('member').value,
      logo: this.memberForm.get('url').value,
      theme: this.memberForm.get('theme').value
      // group: this.memberForm.get('group').value
    };
    // console.log('VALUE for AddMember: ', member);
    this.store.dispatch(new fromMemberAction.AddMember(member));
    this.dialogRef.close();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allCountries.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  // tslint:disable-next-line:use-life-cycle-interface
  public ngOnDestroy() {
    if (this.user$) {
      this.user$.unsubscribe();
    }
  }
}
