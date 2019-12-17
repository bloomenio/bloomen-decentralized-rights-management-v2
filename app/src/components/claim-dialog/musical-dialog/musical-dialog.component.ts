// Basic
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@services/logger/logger.service';
import { RegistryContract } from '@core/core.module';
import { ClaimModel } from '@core/models/claim.model';
import { MemberModel } from '@core/models/member.model';
import { COUNTRIES } from '@constants/countries.constants';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

const log = new Logger('claim-dialog.component');

/**
 * Home-options-shell component
 */
@Component({
    selector: 'blo-claim-dialog',
    templateUrl: 'musical-dialog.component.html',
    styleUrls: ['musical-dialog.component.scss']
})
export class MusicalDialogComponent implements OnInit {

    public claimForm: FormGroup;
    public claimData: any;
    public claim: any;
    public affiliations: string[];
    public members: MemberModel[];


    public oldISWC: any;
    public oldCountries: string[];
    public oldStartDate: any;
    public oldEndDate: any;
    public oldRightTypes: string[];
    public oldSplitPart: any;
    public oldRightHolderRole: any;
    public oldRightHolderProprietaryID: any;
    public oldTitle: any;
    public countries: string[];
    public countriesAll: any;
    public filteredCountries: Observable<string[]>;

    public holderRoles =
        ['Adapter', 'Arranger', 'Lyricist', 'Composer', 'Composer Lyricist', 'SubArranger', 'SubAuthor', 'Translator',
         'Income Participant', 'Original Publisher', 'SubPublisher', 'Royalty Administrator'];

    public rightTypesAll: string[] = ['Mechanical', 'Performance', 'Synchronisation'];

    public separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') public matAutocomplete: MatAutocomplete;

    constructor(
        public dialogRef: MatDialogRef<MusicalDialogComponent>,
        private fb: FormBuilder,
        private registryContract: RegistryContract,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    public async ngOnInit() {

        this.claimForm = this.fb.group({

            rightHolderName: [this.data.claim.memberOwner],
            rightHolderProprietaryID: [this.data.claim.claimData.rightHolderProprietaryID, [Validators.required]],
            rightHolderRole: [this.data.claim.claimData.rightHolderRole, [Validators.required]],
            startDate: [new Date(parseInt(this.data.claim.claimData.startDate, 10)), [Validators.required]],
            endDate: [new Date(parseInt(this.data.claim.claimData.endDate, 10)), [Validators.required]],
            countriesAutocomplete: [''],
            countries: [''],
            splitPart: [this.data.claim.claimData.splitPart, [Validators.required]],
            rightTypes: [this.data.claim.claimData.rightTypes, [Validators.required]]
        });

        this.oldISWC = this.data.claim.claimData.ISWC;
        this.oldCountries = (this.data.claim.claimData.countries) ? this.data.claim.claimData.countries.join(',') : [];
        this.oldStartDate = (this.data.claim.claimData.startDate) ? this.data.claim.claimData.startDate.toString() : 0;
        this.oldEndDate = (this.data.claim.claimData.endDate) ? this.data.claim.claimData.endDate.toString() : 0;
        this.oldRightTypes = (this.data.claim.claimData.rightTypes) ? this.data.claim.claimData.rightTypes : [];
        this.oldSplitPart = (this.data.claim.claimData.splitPart) ? this.data.claim.claimData.splitPart.toString() : '';
        this.oldRightHolderRole = (this.data.claim.claimData.rightHolderRole) ? this.data.claim.claimData.rightHolderRole : '';
        this.oldRightHolderProprietaryID = (this.data.claim.claimData.rightHolderProprietaryID) ? this.data.claim.claimData.rightHolderProprietaryID : '';
        this.oldTitle = this.data.claim.claimData.title;

        this.claimForm.get('rightHolderName').disable();

        if (!this.data.isEditable) {

            this.claimForm.get('rightHolderProprietaryID').disable();
            this.claimForm.get('rightHolderRole').disable();

            this.claimForm.get('startDate').disable();
            this.claimForm.get('endDate').disable();
            this.claimForm.get('rightTypes').disable();
            this.claimForm.get('countries').disable();
            this.claimForm.get('splitPart').disable();
        }

        this.filteredCountries = this.claimForm.get('countriesAutocomplete').valueChanges.pipe(
            startWith(null),
            map((country: string | null) => country ? this._filter(country) : this.countriesAll.slice())
        );

        // this.messages = [];
        // this.data.claim.messageLog.forEach(element => this.messages.push(JSON.parse(element)));

        this.countries = this.data.claim.claimData.countries || [];
        this.countriesAll = COUNTRIES;
        this.members = this.data.members;
        this.affiliations = await this.registryContract.getCMOs();
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
        // console.log(this.claimForm.get('rightTypes').value);
        const claim: ClaimModel = {
            creationDate: this.data.claim.creationDate,
            claimId: this.data.claim.claimId,
            status: this.data.claim.status,
            // messageLog: this.data.claim.messageLog,
            oldClaimData: [
                ['ISWC', this.data.claim.claimData.ISWC],
                ['countries',  this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['rightTypes', this.oldRightTypes.join(',')],
                ['splitPart', this.oldSplitPart],
                ['rightHolderRole', this.oldRightHolderRole],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimData: [
                ['ISWC', this.data.claim.claimData.ISWC],
                ['countries',  this.countries.join(',')],
                ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
                ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
                ['rightTypes', this.claimForm.get('rightTypes').value.join(',')],
                ['splitPart', this.claimForm.get('splitPart').value.toString()],
                ['rightHolderRole', this.claimForm.get('rightHolderRole').value],
                ['rightHolderProprietaryID', this.claimForm.get('rightHolderProprietaryID').value],
                ['title', this.data.claim.claimData.title]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value
        };
        console.log('MusicalDialogComponent.onSubmit');
        console.log(claim);
        this.dialogRef.close(claim);
    }

    public onDelete() {

        const claim: ClaimModel = {
            creationDate: this.data.claim.creationDate,
            claimId: this.data.claim.claimId,
            status: this.data.claim.status,
            // messageLog: this.data.claim.messageLog,
            oldClaimData: [
                ['ISWC', this.data.claim.claimData.ISWC],
                ['countries',  this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['rightTypes', this.oldRightTypes.join(',')],
                ['splitPart', this.oldSplitPart],
                ['rightHolderRole', this.oldRightHolderRole],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimData: [
                ['ISWC', this.data.claim.claimData.ISWC],
                ['countries',  this.oldCountries],
                ['startDate', this.oldStartDate],
                ['endDate', this.oldEndDate],
                ['rightTypes', this.oldRightTypes.join(',')],
                ['splitPart', '0'],
                ['rightHolderRole', this.oldRightHolderRole],
                ['rightHolderProprietaryID', this.oldRightHolderProprietaryID],
                ['title', this.oldTitle]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value
        };
        this.dialogRef.close(claim);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
    }
}
