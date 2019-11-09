import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material';
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
import {ClaimsContract, RegistryContract} from '@services/web3/contracts';
import {ClaimsDataSource} from '@pages/claims/claims.datasource';
import StatusClaimEnum = ClaimModel.StatusClaimEnum;
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;


const log = new Logger('add-musical-work');

@Component({
  selector: 'blo-add-musical-work',
  templateUrl: './add-musical-work.component.html',
  styleUrls: ['./add-musical-work.component.scss']
})
export class AddMusicalWorkComponent implements OnInit {

  public affiliations: string[];
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
      public dialogRef: MatDialogRef<AddMusicalWorkComponent>,
      private fb: FormBuilder,
      public store: Store<any>,
      private claimsContract: ClaimsContract,
      private registryContract: RegistryContract
  ) { }

  public async ngOnInit() {

    this.claimForm = this.fb.group({

      rightHolderName: ['', [Validators.required]],
      title: ['', [Validators.required]],
      ISWC: ['', [Validators.required]],
      claimId: ['', [Validators.required]],
      originalPublisherName: ['142'],
      rightHolderProprietaryID: ['', [Validators.required]],
      rightHolderRole: ['', [Validators.required]],
      startDate: [new Date(), [Validators.required]],
      endDate: ['', [Validators.required]],
      affiliationMec: ['', [Validators.required]],
      affiliationPer: ['', [Validators.required]],
      affiliationSynchro: ['', [Validators.required]],
      countriesAutocomplete: [''],
      countries: ['', [Validators.required]],
      // mechOwner: [''],
      // mechCollec: ['', [Validators.required]],
      mech: ['', [Validators.required]],
      // perforOwner: [''],
      // perforCollec: ['', [Validators.required]],
      perfor: ['', [Validators.required]],
      // syncOwner: [''],
      sync: ['', [Validators.required]],
      messageLog: ['']
    });


    this.messages = [];
    this.countries = [];
    this.countriesAll = COUNTRIES;
    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember).subscribe((member) => {
      this.member = member;
    });
    this.claimForm.controls['rightHolderName'].setValue(this.member.name);
    this.claimForm.get('rightHolderName').disable();
    this.filteredCountries = this.claimForm.get('countriesAutocomplete').valueChanges.pipe(
        startWith(null),
        map((country: string | null) => country ? this._filter(country) : this.countriesAll.slice())
    );
    // this.countries = this.data.claim.claimData.countries || [];
    // this.affiliations = await this.registryContract.getCMOs();
    // this.data.claim.messageLog.forEach(element => this.messages.push(JSON.parse(element)));

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
        ['rightHolderProprietaryID', this.claimForm.get('rightHolderProprietaryID').value],
        ['rightHolderRole', this.claimForm.get('rightHolderRole').value],
        ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
        ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
        ['affiliationMec', this.claimForm.get('affiliationMec').value],
        ['affiliationPer', this.claimForm.get('affiliationPer').value],
        ['affiliationSynchro', this.claimForm.get('affiliationSynchro').value],
        ['countries',  this.countries.join(',')],
        // ['mechOwner', this.claimForm.get('mechOwner').value.toString()],
        // ['mechCollec', this.claimForm.get('mechCollec').value.toString()],
        ['mech', this.claimForm.get('mech').value.toString()],
        // ['perforOwner', this.claimForm.get('perforOwner').value.toString()],
        ['perfor', this.claimForm.get('perfor').value.toString()],
        // ['syncOwner', this.claimForm.get('syncOwner').value.toString()],
        // ['syncCollec', this.claimForm.get('syncCollec').value.toString()],
        ['sync', this.claimForm.get('sync').value.toString()],
        ['title', this.claimForm.get('title').value],
        ['ISWC', this.claimForm.get('ISWC').value]
      ],
      claimType: ClaimTypeEnum.MUSICAL_WORK,
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
