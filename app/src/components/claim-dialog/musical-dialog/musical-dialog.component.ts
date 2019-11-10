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

    public messages: object[];

    public countries: string[];
    public countriesAll: any;
    public filteredCountries: Observable<string[]>;

    public holderRoles = ['Subpublisher', 'Publisher', 'Admin']; // REMOVE THIS


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
            // originalPublisherName: [this.data.claim.memberReceptor],

            rightHolderProprietaryID: [this.data.claim.claimData.rightHolderProprietaryID, [Validators.required]],
            rightHolderRole: [this.data.claim.claimData.rightHolderRole, [Validators.required]],

            startDate: [new Date(parseInt(this.data.claim.claimData.startDate, 10)), [Validators.required]],
            endDate: [new Date(parseInt(this.data.claim.claimData.endDate, 10)), [Validators.required]],

            affiliationMec: [this.data.claim.claimData.affiliationMec, [Validators.required]],
            affiliationPer: [this.data.claim.claimData.affiliationPer, [Validators.required]],
            affiliationSynchro: [this.data.claim.claimData.affiliationSynchro, [Validators.required]],

            countriesAutocomplete: [''],
            countries: [''],

            mechOwner: [this.data.claim.claimData.mechOwner],
            mechCollec: [this.data.claim.claimData.mechCollec],

            perforOwner: [this.data.claim.claimData.perforOwner],
            perforCollec: [this.data.claim.claimData.perforCollec],

            syncOwner: [this.data.claim.claimData.syncOwner],
            syncCollec: [this.data.claim.claimData.syncCollec],

        });

        this.claimForm.get('rightHolderName').disable();

        // if (this.data.disableMemberEdit) {
        //     this.claimForm.get('originalPublisherName').disable();
        // }

        if (!this.data.isEditable) {
            // this.claimForm.get('originalPublisherName').disable();

            this.claimForm.get('rightHolderProprietaryID').disable();
            this.claimForm.get('rightHolderRole').disable();

            this.claimForm.get('startDate').disable();
            this.claimForm.get('endDate').disable();

            this.claimForm.get('affiliationMec').disable();
            this.claimForm.get('affiliationPer').disable();
            this.claimForm.get('affiliationSynchro').disable();

            this.claimForm.get('countries').disable();

            this.claimForm.get('mechOwner').disable();
            this.claimForm.get('mechCollec').disable();

            this.claimForm.get('perforOwner').disable();
            this.claimForm.get('perforCollec').disable();

            this.claimForm.get('syncOwner').disable();
            this.claimForm.get('syncCollec').disable();
        }

        this.filteredCountries = this.claimForm.get('countriesAutocomplete').valueChanges.pipe(
            startWith(null),
            map((country: string | null) => country ? this._filter(country) : this.countriesAll.slice())
        );

        this.messages = [];
        this.data.claim.messageLog.forEach(element => this.messages.push(JSON.parse(element)));

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
        const claim: ClaimModel = {
            creationDate: this.data.claim.creationDate,
            claimId: this.data.claim.claimId,
            status: this.data.claim.status,
            messageLog: this.data.claim.messageLog,
            claimData: [
                ['rightHolderProprietaryID', this.claimForm.get('rightHolderProprietaryID').value],
                ['rightHolderRole', this.claimForm.get('rightHolderRole').value],
                ['startDate', this.claimForm.get('startDate').value.getTime().toString()],
                ['endDate', this.claimForm.get('endDate').value.getTime().toString()],
                ['affiliationMec', this.claimForm.get('affiliationMec').value],
                ['affiliationPer', this.claimForm.get('affiliationPer').value],
                ['affiliationSynchro', this.claimForm.get('affiliationSynchro').value],
                ['countries',  this.countries.join(',')],
                ['mechOwner', this.claimForm.get('mechOwner').value.toString()],
                ['mechCollec', this.claimForm.get('mechCollec').value.toString()],
                ['perforOwner', this.claimForm.get('perforOwner').value.toString()],
                ['perforCollec', this.claimForm.get('perforCollec').value.toString()],
                ['syncOwner', this.claimForm.get('syncOwner').value.toString()],
                ['syncCollec', this.claimForm.get('syncCollec').value.toString()],
                ['title', this.data.claim.claimData.title],
                ['ISWC', this.data.claim.claimData.ISWC]
            ],
            claimType: this.data.claim.claimType,
            memberOwner: this.claimForm.get('rightHolderName').value,
            // memberReceptor: this.claimForm.get('originalPublisherName').value
        };
        this.dialogRef.close(claim);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.countriesAll.filter(country => country.label.toLowerCase().indexOf(filterValue) === 0);
    }
}
