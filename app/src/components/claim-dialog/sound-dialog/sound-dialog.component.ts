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
import {RegistryContract} from '@services/web3/contracts';

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
    private error: any = {isError: false, errorMessage: ''};
    public affiliations: string[];
    public currentMember: MemberModel;

    public useTypesAll: string[] =
        ['Public Performance', 'Airlines', 'Radio Broadcasting', 'Radio Dubbing', 'TV Broadcasting', 'TV Dubbing', 'Background Music',
         'Background Music Dubbing', 'Karaoke Public Performance', 'Karaoke Dubbing', 'Karaoke On Demand',
         'Karaoke On Demand Dubbing', 'Cable Retransmission', 'Radio Simulcast', 'Webcast', 'TV Simulcast', 'CatchUp TV', 'Private Copying', 'Ringback Tones'];
    public countries: string[];
    public countriesAll: any;
    public filteredCountries: Observable<string[]>;

    public oldISRC: any;
    public oldCountries: string[];
    public oldStartDate: any;
    public oldEndDate: any;
    public oldUseTypes: string[];
    public oldSplitPart: any;
    public oldRightHolderProprietaryID: any;
    public oldTitle: any;

    public separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') public matAutocomplete: MatAutocomplete;

    constructor(
        public dialogRef: MatDialogRef<SoundDialogComponent>,
        private fb: FormBuilder,
        private registryContract: RegistryContract,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    public async ngOnInit() {
        this.claimForm = this.fb.group({
            rightHolderName: [this.data.claim.memberOwner, [Validators.required]],
            rightHolderProprietaryID: [this.data.claim.claimData.rightHolderProprietaryID, [Validators.required]],
            startDate: [new Date(parseInt(this.data.claim.claimData.startDate, 10)), [Validators.required]],
            endDate: [new Date(parseInt(this.data.claim.claimData.endDate, 10)), [Validators.required]],
            // compareDates: [this.compareStartEndDates(), Validators.requiredTrue('true')],
            splitPart: [this.data.claim.claimData.splitPart, [Validators.required]],
            countriesAutocomplete: [''],
            countries: [''],
            useTypes: [this.data.claim.claimData.useTypes, [Validators.required]]
        });

        this.compareStartEndDates();
        // const startDate = this.claimForm.get('startDate');
        // console.log('startDate');
        // console.log(startDate.get('Date'));
        // // const endDate = this.claimForm.get('endDate');
        // this.claimForm.get('endDate').valueChanges
        //     .subscribe(endDate => {
        //         console.log('endDate');
        //         console.log(endDate);
        //         if (endDate < startDate) {
        //             this.claimForm.get('endDate').setValue(startDate);
        //             console.log('MPHKE');
        //         }
        //         console.log('startDate.updateValueAndValidity()');
        //         startDate.updateValueAndValidity();
        //         // endDate.updateValueAndValidity();
        //     }
        // );

        this.oldISRC = this.data.claim.claimData.ISRC;
        this.oldCountries = (this.data.claim.claimData.countries) ? this.data.claim.claimData.countries.join(',') : [];
        this.oldStartDate = (this.data.claim.claimData.startDate) ? this.data.claim.claimData.startDate.toString() : 0;
        this.oldEndDate = (this.data.claim.claimData.endDate) ? this.data.claim.claimData.endDate.toString() : 0;
        this.oldUseTypes = (this.data.claim.claimData.useTypes) ? this.data.claim.claimData.useTypes : [];
        this.oldSplitPart = (this.data.claim.claimData.splitPart) ? this.data.claim.claimData.splitPart.toString() : '';
        this.oldRightHolderProprietaryID = (this.data.claim.claimData.rightHolderProprietaryID) ? this.data.claim.claimData.rightHolderProprietaryID : '';
        this.oldTitle = this.data.claim.claimData.title;

        this.claimForm.get('rightHolderName').disable();

        // if (this.data.disableMemberEdit) {
        //     this.claimForm.get('rightOwner').disable();
        // }

        if (!this.data.isEditable) {
            // this.claimForm.get('rightOwner').disable();
            this.claimForm.get('rightHolderProprietaryID').disable();
            this.claimForm.get('startDate').disable();
            this.claimForm.get('endDate').disable();
            this.claimForm.get('splitPart').disable();
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
        this.countries = this.data.claim.claimData.countries || [];
        this.countriesAll = COUNTRIES;
        this.members = this.data.members;
        this.currentMember = this.data.currentMember;
        this.affiliations = await this.registryContract.getCMOs();
        // console.log('this.affiliations');
        // console.log(this.affiliations);
    }

    private compareStartEndDates()  {
        // console.log('startDate');
        // console.log(this.claimForm.get('startDate').value);
        // console.log('endDate');
        // console.log(this.claimForm.get('endDate').value);
        return true;
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
            oldClaimData: [
                ['ISRC', this.data.claim.claimData.ISRC],
                ['countries', this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['useTypes', this.oldUseTypes.join(',')],
                ['splitPart', this.oldSplitPart],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimData: [
                ['ISRC', this.data.claim.claimData.ISRC],
                ['countries', this.countries.join(',')],
                ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
                ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
                ['useTypes', this.claimForm.get('useTypes').value.join(',')],
                ['splitPart', this.claimForm.get('splitPart').value.toString()],
                ['rightHolderProprietaryID', this.claimForm.get('rightHolderProprietaryID').value],
                ['title', this.data.claim.claimData.title]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value
        };
        // console.log('SoundDialogComponent.onSubmit');
        console.log(claim);
        this.dialogRef.close(claim);
    }

    public onDelete() {
        const claim: ClaimModel = {
            creationDate: this.data.claim.creationDate,
            claimId: this.data.claim.claimId,
            status: this.data.claim.status,
            oldClaimData: [
                ['ISRC', this.data.claim.claimData.ISRC],
                ['countries', this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['useTypes', this.oldUseTypes.join(',')],
                ['splitPart', this.oldSplitPart],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimData: [
                ['ISRC', this.data.claim.claimData.ISRC],
                ['countries', this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['useTypes', this.oldUseTypes.join(',')],
                ['splitPart', '0'],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value
        };
        console.log(claim);
        this.dialogRef.close(claim);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
    }
}
