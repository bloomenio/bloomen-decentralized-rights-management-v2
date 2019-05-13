import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ROLES } from '@core/constants/roles.constants';

import { UserModel } from '@core/models/user.model';

@Component({
  selector: 'blo-dialog-user-data',
  templateUrl: './dialog-user-data.component.html',
  styleUrls: ['./dialog-user-data.component.scss']
})
export class DialogUserDataComponent implements OnInit {

  public editUserForm: FormGroup;
  public nameIcon: string;
  public roles: string[];

  constructor(public dialogRef: MatDialogRef<DialogUserDataComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit(): void {
    this.editUserForm = this.fb.group({
      firstName: [this.data.user.firstName, [Validators.required]],
      lastName: [this.data.user.lastName, [Validators.required]],
      memberId: [this.data.user.memberId, [Validators.required]],
      role: [this.data.user.role, [Validators.required]],
      id: [this.data.user.owner, [Validators.required]],
    });
    this.roles = [ROLES.USER, ROLES.ADMIN];
    this.editUserForm.get('id').disable();
    this.editUserForm.get('role').disable();
    this.editUserForm.get('memberId').disable();
    this.nameIcon = this.data.user.firstName.trim()[0].toUpperCase() + this.data.user.lastName.trim()[0].toUpperCase();
  }

  public onSubmit(): void {
    const user: UserModel = {
      creationDate: this.data.user.creationDate,
      firstName: this.editUserForm.get('firstName').value,
      lastName: this.editUserForm.get('lastName').value,
      memberId: this.editUserForm.get('memberId').value,
      owner: this.data.user.owner,
      requestId: this.data.user.requestId,
      role: this.editUserForm.get('role').value,
      status: this.data.user.status
    };
    this.dialogRef.close(user);
  }

}
