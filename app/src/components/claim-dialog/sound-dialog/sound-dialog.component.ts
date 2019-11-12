// Basic
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@services/logger/logger.service';
import { MemberModel } from '@core/models/member.model';
import { ClaimModel } from '@core/models/claim.model';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { COUNTRIES } from '@core/constants/countries.constants';

const log = new Logger('sound-dialog.component');

/**
 * Home-options-shell component
 */
@Component({
    selector: 'blo-claim-dialog',
    templateUrl: 'sound-dialog.component.html',
    styleUrls: ['sound-dialog.component.scss']
})
export class SoundDialogComponent implements OnInit {

    public claimForm: FormGroup;
    public members: MemberModel[];

    public useTypesAll: string[] =
        ['Public Performance', 'Airlines', 'Radio Broadcasting', 'Radio Dubbing', 'TV Broadcasting', 'TV Dubbing', 'Background Music',
         'Background Music Dubbing', 'Karaoke Public Performance', 'Karaoke Dubbing', 'Karaoke On Demand',
         'Karaoke On Demand Dubbing', 'Cable Retransmission', 'Radio Simulcast', 'Webcast', 'TV Simulcast', 'CatchUp TV', 'Private Copying', 'Ringback Tones'];
    public countries: string[];
    public countriesAll: any;
    public filteredCountries: Observable<string[]>;

    // public messages: object[];

    public separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') public matAutocomplete: MatAutocomplete;

    constructor(
        public dialogRef: MatDialogRef<SoundDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    public ngOnInit() {
        this.claimForm = this.fb.group({
            rightHolderName: [this.data.claim.memberOwner, [Validators.required]],
            // rightOwner: [this.data.claim.memberReceptor, [Validators.required]],
            rightHolderProprietaryID: [this.data.claim.claimData.rightHolderProprietaryID, [Validators.required]],
            startDate: [new Date(parseInt(this.data.claim.claimData.startDate, 10)), [Validators.required]],
            endDate: [new Date(parseInt(this.data.claim.claimData.endDate, 10)), [Validators.required]],
            split: [this.data.claim.claimData.split, [Validators.required]],
            countriesAutocomplete: [''],
            countries: [''],
            useTypes: [this.data.claim.claimData.useTypes, [Validators.required]]
        });

        this.claimForm.get('rightHolderName').disable();

        // if (this.data.disableMemberEdit) {
        //     this.claimForm.get('rightOwner').disable();
        // }

        if (!this.data.isEditable) {
            // this.claimForm.get('rightOwner').disable();
            this.claimForm.get('rightHolderProprietaryID').disable();
            this.claimForm.get('startDate').disable();
            this.claimForm.get('endDate').disable();
            this.claimForm.get('split').disable();
            this.claimForm.get('countries').disable();
            this.claimForm.get('useTypes').disable();
        }

        this.countries = this.data.claim.claimData.countries || [];

        // this.messages = [];
        // this.data.claim.messageLog.forEach(element => this.messages.push(JSON.parse(element)));

        this.countriesAll = COUNTRIES;
        this.members = this.data.members;

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
        this.countries = this.countries.sort((one, two) => (one < two ? -1 : 1)); // sort ascending
        const x = (names) => names.filter((v, i) => names.indexOf(v) === i); // remove duplicates
        this.countries = x(this.countries);
        // console.log(this.claimForm.get('useTypes').value);
        const claim: ClaimModel = {
            creationDate: this.data.claim.creationDate,
            claimId: this.data.claim.claimId,
            status: this.data.claim.status,
            // messageLog: this.data.claim.messageLog,
            claimData: [
                ['ISRC', this.data.claim.claimData.ISRC],
                ['countries', this.countries.join(',')],
                ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
                ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
                ['useTypes', this.claimForm.get('useTypes').value.join(',')],
                ['split', this.claimForm.get('split').value.toString()],
                ['rightHolderProprietaryID', this.claimForm.get('rightHolderProprietaryID').value],
                ['title', this.data.claim.claimData.title]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value,
            // memberReceptor: this.claimForm.get('rightOwner').value
        };
        this.dialogRef.close(claim);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
    }
}
