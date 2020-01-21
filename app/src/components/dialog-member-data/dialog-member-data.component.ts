import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ROLES } from '@core/constants/roles.constants';

import {MemberModel} from '@models/member.model';

@Component({
  selector: 'blo-dialog-member-data',
  templateUrl: './dialog-member-data.component.html',
  styleUrls: ['./dialog-member-data.component.scss']
})
export class DialogMemberDataComponent implements OnInit {

  public editMemberForm: FormGroup;
  public collections: string[];

  constructor(public dialogRef: MatDialogRef<DialogMemberDataComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit(): void {
    this.editMemberForm = this.fb.group({
      name: [this.data.member.name, [Validators.required]],
      memberId: [this.data.member.memberId, [Validators.required]],
      theme: [this.data.member.theme, [Validators.required]],
      collections: [this.data.member.collections, [Validators.required]]
    });
    this.editMemberForm.get('theme').disable();
    this.editMemberForm.get('memberId').disable();
    this.editMemberForm.get('logo').disable();
    this.editMemberForm.get('claims').disable();
    this.editMemberForm.get('country').disable();
    this.editMemberForm.get('claimInbox').disable();
    this.editMemberForm.get('userRequests').disable();
    this.editMemberForm.get('cmo').disable();
  }

  public onSubmit(): void {
    const member: MemberModel = {
      memberId: this.editMemberForm.get('memberId').value,
      creationDate: this.data.member.creationDate,
      name: this.editMemberForm.get('name').value,
      logo: this.data.member.logo,
      country: this.data.member.country,
      cmo: this.data.member.cmo,
      theme: this.editMemberForm.get('theme').value
    };
    this.dialogRef.close(member);
  }

}
