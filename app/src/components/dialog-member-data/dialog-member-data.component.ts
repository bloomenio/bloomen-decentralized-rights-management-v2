import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ROLES } from '@core/constants/roles.constants';
import {MemberModel} from '@models/member.model';
import * as fromMemberAction from '@stores/member/member.actions';
import {Store} from '@ngrx/store';

export let collections: string[] = ['test', 'first', 'second', 'third'];

@Component({
  selector: 'blo-dialog-member-data',
  templateUrl: './dialog-member-data.component.html',
  styleUrls: ['./dialog-member-data.component.scss']
})

export class DialogMemberDataComponent implements OnInit {

  public editMemberForm: FormGroup;
  public collections = collections;

  constructor(public dialogRef: MatDialogRef<DialogMemberDataComponent>,
    private fb: FormBuilder,
    private store: Store<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit(): void {
    this.editMemberForm = this.fb.group({
      name: [this.data.member.name, [Validators.required]],
      memberId: [this.data.member.memberId, [Validators.required]],
      theme: [this.data.member.theme, [Validators.required]],
      logo: [this.data.member.logo, [Validators.required]],
      totalTokens: [this.data.member.totalTokens, [Validators.required]]
      // group: [this.data.member.group, [Validators.required]]
    });
    this.editMemberForm.get('theme').disable();
    this.editMemberForm.get('memberId').disable();
    // this.editMemberForm.get('claims').disable();
    // this.editMemberForm.get('claimInbox').disable();
    // this.editMemberForm.get('userRequests').disable();
  }

  public onSubmit(): void {
    const member: MemberModel = {
      memberId: this.editMemberForm.get('memberId').value,
      creationDate: this.data.member.creationDate,
      name: this.editMemberForm.get('name').value,
      logo: this.editMemberForm.get('logo').value,
      country: this.data.member.country,
      cmo: this.data.member.cmo,
      theme: this.editMemberForm.get('theme').value
      // group: this.editMemberForm.get('group').value
    };
    // console.log('MEMBER\n', member);
    this.dialogRef.close(member);
  }

}
