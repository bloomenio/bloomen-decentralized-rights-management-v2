import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromMemberSelectors from '@stores/member/member.selectors';

import {Logger} from '@services/logger/logger.service';

import {ClaimModel} from '@core/models/claim.model';
import {COUNTRIES} from '@constants/countries.constants';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MemberModel} from '@models/member.model';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import StatusClaimEnum = ClaimModel.StatusClaimEnum;
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;
import {ClaimsContract} from '@services/web3/contracts';
import {ClaimsDataSource} from '@pages/claims/claims.datasource';


const log = new Logger('add-sound-recording');

@Component({
  selector: 'blo-add-sound-recording',
  templateUrl: './add-sound-recording.component.html',
  styleUrls: ['./add-sound-recording.component.scss']
})
export class AddSoundRecordingComponent implements OnInit {

  public dataSource: ClaimsDataSource;
  public claimForm: FormGroup;
  public useTypesAll: string[] = ['Public Performance', 'Airlines', 'Radio Broadcasting', 'Radio Dubbing', 'TV Broadcasting'];

  public countries: string[];
  public countriesAll: any;
  public filteredCountries: Observable<string[]>;
  public messages: object[];

  public member$: Subscription;
  public member: MemberModel;

  public separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') public matAutocomplete: MatAutocomplete;

  constructor(
      public dialogRef: MatDialogRef<AddSoundRecordingComponent>,
      private fb: FormBuilder,
      public store: Store<any>,
      private claimsContract: ClaimsContract
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

    this.countriesAll = COUNTRIES;
    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
      this.member = member;
    });
    this.claimForm.controls['rightHolderName'].setValue(this.member.name);
    // console.log(this.claimForm.get('rightHolderName').value);

    this.filteredCountries = this.claimForm.get('countriesAutocomplete').valueChanges.pipe(
        startWith(null),
        map((country: string | null) => country ? this._filter(country) : this.countriesAll.slice())
    );


    this.dataSource = new ClaimsDataSource(this.claimsContract);
    this.dataSource.loadClaims();
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
      status: StatusClaimEnum.CONFLICT,
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
      memberReceptor: 142
    };
    this.dialogRef.close(claim);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
  }
}
