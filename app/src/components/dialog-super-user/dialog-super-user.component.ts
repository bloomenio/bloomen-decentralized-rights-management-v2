import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ROLES } from '@core/constants/roles.constants';
import { UserModel } from '@core/models/user.model';
import {collections} from '@components/dialog-member-data/dialog-member-data.component';

@Component({
  selector: 'blo-dialog-user-data',
  templateUrl: './dialog-super-user.component.html',
  styleUrls: ['./dialog-super-user.component.scss']
})
export class DialogSuperUserComponent implements OnInit {

  public editUserForm: FormGroup;
  public nameIcon: string;
  public roles: string[];
  public allGroups = collections;

  constructor(public dialogRef: MatDialogRef<DialogSuperUserComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public ngOnInit(): void {
    this.editUserForm = this.fb.group({
      firstName: [this.data.user.firstName, [Validators.required]],
      lastName: [this.data.user.lastName, [Validators.required]],
      memberId: [this.data.user.memberId, [Validators.required]],
      groups: [this.data.user.groups, [Validators.required]],
      owner: [this.data.user.owner, [Validators.required]],
      cmo: [this.data.user.cmo, [Validators.required]]
    });

    // this.roles = [ROLES.USER, ROLES.ADMIN];
    this.editUserForm.get('cmo').disable();
    this.editUserForm.get('owner').disable();
    this.editUserForm.get('memberId').disable();
    this.nameIcon = this.data.user.firstName.trim()[0].toUpperCase() + this.data.user.lastName.trim()[0].toUpperCase();
  }

  public onSubmit() {
    const user: UserModel = {
      creationDate: this.data.user.creationDate,
      firstName: this.editUserForm.get('firstName').value,
      lastName: this.editUserForm.get('lastName').value,
      memberId: this.editUserForm.get('memberId').value,
      owner: this.data.user.owner,
      requestId: this.data.user.requestId,
      role: this.data.user.role,
      status: this.data.user.status,
      groups: this.editUserForm.get('groups').value
    };
    console.log('user from dialog-super-user');
    console.log(user);
    this.dialogRef.close(user);
  }

}
