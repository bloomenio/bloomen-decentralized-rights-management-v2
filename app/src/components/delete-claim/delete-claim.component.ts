// Basic
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@services/logger/logger.service';
import { MemberModel } from '@core/models/member.model';
import { ClaimModel } from '@core/models/claim.model';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {Observable, Subscription} from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { COUNTRIES } from '@core/constants/countries.constants';
import {MusicalDialogComponent} from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import {Store} from '@ngrx/store';

const log = new Logger('delete-claim.component');

@Component({
    selector: 'blo-claim-dialog',
    templateUrl: 'delete-claim.component.html',
    styleUrls: ['delete-claim.component.scss']
})
export class DeleteClaimComponent implements OnInit {

    // public dialog: any;
    private members: MemberModel[];
    private members$: Subscription;

    constructor(
        public dialogRef: MatDialogRef<DeleteClaimComponent>,
        private fb: FormBuilder,
        private store: Store<any>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    public ngOnInit() {


        this.members$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe(members => {
            this.members = members;
        });

        // let dialog;
        //
        // switch (element.claimType) {
        //     case false:
        //         dialog = this.dialog.open(MusicalDialogComponent, {
        //             data: {
        //                 claim: element,
        //                 members: this.members,
        //                 disableMemberEdit: true,
        //                 isEditable: false
        //             },
        //             width: '900px',
        //             height: '610px'
        //         });
        //         break;
        //     case true:
        //         dialog = this.dialog.open(SoundDialogComponent, {
        //             data: {
        //                 claim: element,
        //                 members: this.members,
        //                 disableMemberEdit: true,
        //                 isEditable: false
        //             },
        //             width: '900px',
        //             height: '510px'
        //         });
        //         break;
        //     default:
        //         break;
        // }

    }

    public onSubmit() {
        this.dialogRef.close(true);
    }

}
