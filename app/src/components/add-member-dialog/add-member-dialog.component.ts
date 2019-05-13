import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';
import * as fromMemberAction from '@stores/member/member.actions';
import { Logger } from '@services/logger/logger.service';

import { MemberModel } from '@core/models/member.model';

import { COUNTRIES } from '@constants/countries.constants';
import { startWith, map } from 'rxjs/operators';

const log = new Logger('add-member-dialog');

@Component({
  selector: 'blo-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss']
})
export class AddMemberDialogComponent implements OnInit {

  public memberForm: FormGroup;
  public userData: any;
  public nameIcon: string;

  public cmos$: Observable<any>;

  public filteredCountries: Observable<string[]>;
  public allCountries: any[];

  constructor(
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    private fb: FormBuilder,
    public store: Store<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  public ngOnInit() {
    this.memberForm = this.fb.group({
      cmo: ['', [Validators.required]],
      member: ['', [Validators.required]],
      url: ['', [Validators.required]],
      country: ['', [Validators.required]],
      theme: ['', [Validators.required]],
    });

    this.filteredCountries = this.memberForm.get('country').valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.allCountries = COUNTRIES;
    this.cmos$ = this.store.select(fromCmosSelectors.getCmos);
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
    };
    this.store.dispatch(new fromMemberAction.AddMember(member));
    this.dialogRef.close();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allCountries.filter(option => option.label.toLowerCase().includes(filterValue));
  }

}
