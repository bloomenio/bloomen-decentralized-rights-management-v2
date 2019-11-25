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

const log = new Logger('delete-claim.component');

/**
 * Home-options-shell component
 */
@Component({
    selector: 'blo-claim-dialog',
    templateUrl: 'delete-claim.component.html',
    styleUrls: ['delete-claim.component.scss']
})
export class DeleteClaimComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<DeleteClaimComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    public ngOnInit() {
    }

    public onSubmit() {
        this.dialogRef.close(true);
    }

}
