import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromUserSelectors from '@stores/user/user.selectors';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';
import * as fromMemberSelectors from '@stores/member/member.selectors';

import {Logger} from '@services/logger/logger.service';

import {ClaimModel} from '@core/models/claim.model';
import {COUNTRIES} from '@constants/countries.constants';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MemberModel} from '@models/member.model';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import StatusClaimEnum = ClaimModel.StatusClaimEnum;
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;
import * as fromClaimActions from '@stores/claim/claim.actions';

const log = new Logger('add-claim-dialog');

@Component({
  selector: 'blo-add-claim-dialog',
  templateUrl: './add-claim-dialog.component.html',
  styleUrls: ['./add-claim-dialog.component.scss']
})
export class AddClaimDialogComponent implements OnInit {

  public claimForm: FormGroup;
  public useTypesAll: string[] = ['Public Performance', 'Airlines', 'Radio Broadcasting', 'Radio Dubbing', 'TV Broadcasting'];

  public countries: string[];
  public countriesAll: any;
  public filteredCountries: Observable<string[]>;
  public messages: object[];

  public cmos$: Observable<any>;
  public users$: Observable<any>;
  // public members: ClaimModel[];
  public members: MemberModel[];
  public members$: Observable<any>;
  public member$: Subscription;
  public member: MemberModel;

  public separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') public matAutocomplete: MatAutocomplete;

  constructor(
      public dialogRef: MatDialogRef<SoundDialogComponent>,
      private fb: FormBuilder,
      public store: Store<any>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit() {
    this.claimForm = this.fb.group({
      rightHolderName: ['', [Validators.required]],
      startDate: [new Date(), [Validators.required]],
      endDate: ['', [Validators.required]],
      sliderValue: ['', [Validators.required]],
      countriesAutocomplete: [''],
      countries: [''],
      useTypes: ['', [Validators.required]],
      claimId: ['', [Validators.required]],
      // claimType: ['', [Validators.required]],
      ISRC: ['', [Validators.required]],
      title: ['', [Validators.required]],
      messageLog: ['']
    });

    this.countries = [];
    this.messages = [];
    // this.data.claim.messageLog.forEach(element => this.messages.push(JSON.parse(element)));

    this.countriesAll = COUNTRIES;
    this.cmos$ = this.store.select(fromCmosSelectors.getCmos);
    // this.users$ = this.store.select(fromUserSelectors.getUser);
    // this.members$ = this.store.select(fromMemberSelectors.getCurrentMember);
    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
      this.member = member;
    });
    this.claimForm.controls['rightHolderName'].setValue(this.member.name);
    console.log(this.claimForm.get('rightHolderName').value);
    // this.member = fromMemberSelectors.getCurrentMember.toString();

    this.filteredCountries = this.claimForm.get('countriesAutocomplete').valueChanges.pipe(
        startWith(null),
        map((country: string | null) => country ? this._filter(country) : this.countriesAll.slice())
    );
  }

  public add(event: MatChipInputEvent) {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.countries.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.claimForm.get('countries').setValue(null);
    }
  }

  public remove(country: string) {
    const index = this.countries.indexOf(country);

    if (index >= 0) {
      this.countries.splice(index, 1);
    }
  }

  public selected(event: MatAutocompleteSelectedEvent) {
    this.countries.push(event.option.viewValue);
    this.countryInput.nativeElement.value = '';
    this.claimForm.get('countries').setValue(null);
  }

  public onSubmit() {
    const claim: ClaimModel = {
      creationDate: new Date().getTime(),
      claimId: this.claimForm.get('claimId').value,
      status: StatusClaimEnum.CLAIMED,
      messageLog: this.claimForm.get('messageLog').value,
      claimData: [
        ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
        ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
        ['sliderValue', this.claimForm.get('sliderValue').value.toString()],
        ['countries', this.countries.join(',')],
        ['useTypes', this.claimForm.get('useTypes').value.join(',')],
        ['title', this.claimForm.get('title').value],
        ['ISRC', this.claimForm.get('ISRC').value]
      ],
      claimType: ClaimTypeEnum.SOUND_RECORDING,
      memberOwner: this.claimForm.get('rightHolderName').value,
      // memberReceptor: this.claimForm.get('rightOwner').value
    };
    this.store.dispatch(new fromClaimActions.AddClaim(claim));
    this.dialogRef.close(claim);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
  }
}
