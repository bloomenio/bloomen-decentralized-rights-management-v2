import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ROLES } from '@core/constants/roles.constants';
import { UserModel } from '@core/models/user.model';
// import {currentMember} from '@pages/inbox/inbox.component';
import {UserContract} from '@services/web3/contracts';
import * as fromUserActions from '@stores/user/user.actions';
const IPFS = require('ipfs');

export let node: any;

@Component({
  selector: 'blo-dialog-user-data',
  templateUrl: './kyc-dialog-user-data.component.html',
  styleUrls: ['./kyc-dialog-user-data.component.scss']
})

export class KYCDialogUserDataComponent implements OnInit {

  public editUserForm: FormGroup;
  public nameIcon: string;
  public roles: string[];
  public usedTokens: number;
  private currentMember: any;
  private max: any;
  private kycData: any;

  constructor(
      public dialogRef: MatDialogRef<KYCDialogUserDataComponent>,
      private fb: FormBuilder,
      public userContract: UserContract,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public async ngOnInit() {
    this.editUserForm = this.fb.group({
      firstName: [this.data.user.firstName, [Validators.required]],
      lastName: [this.data.user.lastName, [Validators.required]],
      memberId: [this.data.user.memberId, [Validators.required]],
      role: [this.data.user.role, [Validators.required]],
      id: [this.data.user.owner, [Validators.required]],
      tokens: [this.data.user.tokens, [Validators.required, Validators.min(0), Validators.max(this.data.member.totalTokens)]],
      kycData: [this.data.user.kycData, [Validators.required]],
      accountExpirationDate: [new Date(parseInt(this.data.user.accountExpirationDate, 10)
                              || new Date().getTime(), [Validators.required]]
    });
    this.currentMember = this.data.member;
    this.usedTokens = this.data.usedTokens;
    this.max = this.data.member.totalTokens - this.usedTokens;
    // console.log('Total Tokens are ', this.data.member.totalTokens, ' and usedTokens are ', this.usedTokens);
    // usedTokens = this.usedTokens;
    this.roles = [ROLES.USER, ROLES.ADMIN];
    this.editUserForm.get('id').disable();
    this.editUserForm.get('role').disable();
    this.editUserForm.get('memberId').disable();
    // if (this.data.user.role === ROLES.USER) {
    this.editUserForm.get('firstName').disable();
    this.editUserForm.get('lastName').disable();
    this.editUserForm.get('tokens').disable();
    // }
    this.nameIcon = this.data.user.firstName.trim()[0].toUpperCase() + this.data.user.lastName.trim()[0].toUpperCase();
  }

  public onSubmit() {
    if (this.editUserForm.get('firstName').value === this.data.user.firstName &&
        this.editUserForm.get('lastName').value === this.data.user.lastName &&
        this.editUserForm.get('memberId').value === this.data.user.memberId &&
        this.editUserForm.get('tokens').value === this.data.user.tokens &&
        this.editUserForm.get('role').value === this.data.user.role &&
        this.editUserForm.get('kycData').value === this.data.user.kycData &&
        this.editUserForm.get('accountExpirationDate').value.getTime() ===
        new Date(parseInt(this.data.user.accountExpirationDate, 10)) ) {
      alert('Should not upload the same documents.');
    } else {
      if (this.editUserForm.get('kycData').value === this.data.user.kycData) {
        const user: UserModel = {
          creationDate: this.data.user.creationDate,
          firstName: this.editUserForm.get('firstName').value,
          lastName: this.editUserForm.get('lastName').value,
          memberId: this.editUserForm.get('memberId').value,
          tokens: this.editUserForm.get('tokens').value,
          owner: this.data.user.owner,
          requestId: this.data.user.requestId,
          role: this.editUserForm.get('role').value,
          status: this.data.user.status,
          kycData: this.data.user.kycData,
          accountExpirationDate: this.editUserForm.get('accountExpirationDate').value.getTime()
        };
        alert('Should not upload the same documents.');
      } else {  // new kycData
        Promise.resolve()
            .then(async () => {
              await this.onFileSelected(this.editUserForm.get('kycData').value);
              Promise.resolve()
                  .then(() => {
                    this.ipfsManager().then(r => {
                      const user: UserModel = {
                        creationDate: this.data.user.creationDate,
                        firstName: this.editUserForm.get('firstName').value,
                        lastName: this.editUserForm.get('lastName').value,
                        memberId: this.editUserForm.get('memberId').value,
                        tokens: this.editUserForm.get('tokens').value,
                        owner: this.data.user.owner,
                        requestId: this.data.user.requestId,
                        role: this.editUserForm.get('role').value,
                        status: this.data.user.status,
                        kycData: this.kycData,
                        accountExpirationDate: this.editUserForm.get('accountExpirationDate').value.getTime()
                      };
                      this.dialogRef.close(user);
                    });
                  });
            });
      }
    }
  }

  public async ipfsManager() {
    // Adding data to IPFS
    if (node === undefined) {
      node = await IPFS.create();
    }
    // const version = await node.version();
    // console.log('Version:', version.version);
    const data = this.kycData; // 'kycData'; // this.userForm.get('kycData');
    // add your data to to IPFS - this can be a string, a Buffer,
    // a stream of Buffers, etc

    const results = node.add(data);
    // we loop over the results because 'add' supports multiple
    // additions, but we only added one entry here so we only see
    // one log line in the output

    for await (const {cid} of results) {
      // CID (Content IDentifier) uniquely addresses the data
      // console.log(cid.toString());
      this.kycData = cid.toString();
      this.editUserForm.get('kycData').setValue(this.kycData);
      // console.log('ipfsManager.awaitCID ', this.kycData);
    }
    // and can be used to get it again.

    // Getting data from IPFS
    // node = await IPFS.create();

    // const stream = node.cat(results.toString());
    // data = '';
    //
    // for await (const chunk of stream) {
    //   // chunks of data are returned as a Buffer, convert it back to a string
    //   data += chunk.toString();
    // }
    // console.log(data);
    // Using the CLI
    // npm install ipfs -g
    // jsipfs cat QmXuxvjnjk2iT6Xmx3xmWQixy9CNwowGvZBkwMjifr3TxN
    //
    // Using the HTTP Gateway
    // https://ipfs.io/ipfs/QmXuxvjnjk2iT6Xmx3xmWQixy9CNwowGvZBkwMjifr3TxN
  }

  public onFileSelected(inputNode) {
    // const inputNode: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.kycData = e.target.result;
        // console.log(this.kycData);
        // console.log('onFileSelected');
      };
      reader.readAsText(inputNode);
    }
  }

  public openLink() {
    window.open('https://ipfs.io/ipfs/' + this.data.user.kycData, '_blank');
  }

  public clear() {
    this.kycData = undefined;
    this.editUserForm.get('kycData').setValue(this.data.user.kycData);
  }
}
