// Basic
import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import {FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import { Store } from '@ngrx/store';

import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromUserActions from '@stores/user/user.actions';

import * as fromMemberSelectors from '@stores/member/member.selectors';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';

import { MemberModel } from '@core/models/member.model';
import { Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ROLES } from '@core/constants/roles.constants';
import { UserModel } from '@core/models/user.model';

const log = new Logger('user-form.component');
const IPFS = require('ipfs');


/**
 * User form page
 */
@Component({
  selector: 'blo-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {

  public userForm: FormGroup;
  private members: MemberModel[];
  public cmos: string[];
  public membersFiltered: MemberModel[];
  public roles: string[];

  public member$: Subscription;
  public cmos$: Subscription;

  public autoFill: boolean;
  public autoFillMultiCMO: boolean;

  @ViewChild('fileInput') public fileInput: ElementRef;
  private kycData: any;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public fb: FormBuilder,
    public store: Store<any>
  ) { }

  public ngOnInit() {
    this.autoFillMultiCMO = false;
    this.autoFill = false;
    if (!this.autoFill) {
      this.userForm = this.fb.group({
        firstName: ['', [Validators.required]],      // onSubmit()
        lastName: ['', [Validators.required]],
        cmo: ['', [Validators.required]],
        member: ['', [Validators.required]],
        role: ['', [Validators.required]],
        kycData: [undefined, [Validators.required]]
      });
    } else {
      this.userForm = this.fb.group({
        firstName: [''],                            // onSubmitAutoFill()
        lastName: [''],
        cmo: [''],
        member: [''],
        role: ['']
      });
    }

    this.member$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe((members) => {
      this.members = members;
    });

    this.cmos$ = this.store.select(fromCmosSelectors.getCmos).subscribe((cmos) => {
      this.cmos = cmos;
    });

    this.roles = [ROLES.USER, ROLES.ADMIN];
    // console.log('ngOnInit member value is ' + this.userForm.get('member').value);
  }

  public onChange() {
    console.log('onChange_1 member value is ' + this.userForm.get('member').value);

    of(this.members).pipe(
      map((members) => {
        let cmo = this.userForm.get('cmo').value; // onSubmit()
        if (this.autoFill) {
          cmo = 'cmo1';                            // onSubmitAutoFill()
        }
        if (!cmo) {
          return [];
        } else {
          return members.filter(member => member.cmo === cmo );
        }
      })
    ).toPromise().then((members) => {
      this.membersFiltered = members;
      this.userForm.get('member').setValue(undefined);
    });
    // console.log('onChange_2 member value is ' + this.userForm.get('member').value);
  }

  public async onSubmit() {
    // console.log('onSubmit membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
    // console.log('onSubmit membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    // console.log('KYC doc ' + this.userForm.get('kycData').value);
    // console.assert();
    // console.log(this.userForm.get('kycData').value);
    Promise.resolve()
        .then(() => {
          Promise.resolve()
              .then(() => {
                this.onFileSelected(this.userForm.get('kycData').value);
              })
              .then(async () => {
                // console.log(this.kycData);
                await this.ipfsManager()
                    .then(r => {
                      console.log(this.kycData);
                      const user: UserModel = {
                        // creationDate: new Date().getTime(),
                        firstName: this.userForm.get('firstName').value,
                        lastName: this.userForm.get('lastName').value,
                        memberId: this.userForm.get('member').value,
                        role: this.userForm.get('role').value,
                        kycData: this.userForm.get('kycData').value
                      };
                      this.store.dispatch(new fromUserActions.SendUser(user));
                      console.log(user);
                      // console.log(new Date().getTime());
                      this.router.navigate(['waiting-approve']);
                });
              });
        });
  }

  public autoMultiCMO(name: string) {
    let user;
    switch (name) {
      case 'Alex':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Alex',
          lastName: 'Psychas',
          memberId: Number(1).toString(),
          // when approved as CMO=cmo1, the memberId will be the next of the last member added through script,
          // but we input the memberId of a CMO's member.
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Evolution':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'Evolution',
          memberId: Number(1).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Audio':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'AudioCoop',
          memberId: Number(2).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'AFI':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'AFI',
          memberId: Number(3).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'GetSound':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'GetSound',
          memberId: Number(4).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'ITSRIGHT':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'ITSRIGHT',
          memberId: Number(5).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'SCF':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'SCF',
          memberId: Number(6).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Turo':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Turo',
          lastName: 'Pekari',
          memberId: Number(7).toString(),
          // when approved as CMO, the memberId will be the next of the last member added through script,
          // but we input the memberId of a CMO's member.
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Test':
        user = {
          // creationDate: new Date().getTime(),
          firstName: 'Admin',
          lastName: 'Test Publisher',
          memberId: Number(7).toString(),
          role: 'Admin'
        };
        // console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      default:
        break;
    }
  }

  public autoMultiCMOold(name: string) {
    let user;
    switch (name) {
      case 'Alex':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Alex',
          lastName: 'Psychas',
          memberId: Number(1).toString(),
          // when approved as CMO, the memberId will be the next of the last member added through script,
          // but we input the memberId of a CMO's member.
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Gonçal':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Gonçal',
          lastName: 'Calvo',
          memberId: Number(1).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Mirko':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Mirko',
          lastName: 'Lorenz',
          memberId: Number(2).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Amaryllis':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Amaryllis',
          lastName: 'Raouzaiou',
          memberId: Number(2).toString(),
          // when approved as CMO, the memberId will be the next of the last member added through script,
          // but we input the memberId of a CMO's member.
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Jordi':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Jordi',
          lastName: 'Escudero',
          memberId: Number(3).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Daniel':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Daniel',
          lastName: 'Harris',
          memberId: Number(4).toString(),
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      case 'Turo':
        user = {
          creationDate: new Date().getTime(),
          firstName: 'Turo',
          lastName: 'Pekari',
          memberId: Number(5).toString(),
          // when approved as CMO, the memberId will be the next of the last member added through script,
          // but we input the memberId of a CMO's member.
          role: 'Admin'
        };
        console.log(user);
        this.store.dispatch(new fromUserActions.SendUser(user));
        this.router.navigate(['waiting-approve']);
        break;
      default:
        break;
    }
  }

  public onSubmitAutoFill() {
    // @ts-ignore
    const isFirefox = typeof InstallTrigger !== 'undefined';
    console.log(isFirefox);
    if (isFirefox) {
      const user: UserModel = {
        // creationDate: new Date().getTime(),
        firstName: 'Gonçal',
        lastName: 'Calvo',
        memberId: this.membersFiltered[0].memberId.toString(),
        role: 'Admin',
        kycData: undefined
      };
      console.log(user);
      this.store.dispatch(new fromUserActions.SendUser(user));
      this.router.navigate(['waiting-approve']);

      console.log('AutoFill_ended');
      console.log('AutoFill_1 membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
   // console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    } else { // Opera
      const user: UserModel = {
        // creationDate: new Date().getTime(),
        firstName: 'Alex',
        lastName: 'Psychas',
        memberId: this.membersFiltered[0].memberId.toString(),
        role: 'Admin',
        kycData: undefined
      };
      console.log(user);
      this.store.dispatch(new fromUserActions.SendUser(user));
      this.router.navigate(['waiting-approve']);

      console.log('AutoFill_ended');
      console.log('AutoFill_1 membersFiltered is ' + this.membersFiltered[0].memberId + ' ' + this.membersFiltered[0].cmo + ' ' + this.membersFiltered[0].name);
   // console.log('AutoFill_2 membersFiltered is ' + this.membersFiltered[1].memberId + ' ' + this.membersFiltered[1].cmo + ' ' + this.membersFiltered[1].name);
    }
  }

  public onCancel() {
    this.store.dispatch(new fromMnemonicActions.RemoveMnemonic());
    this.router.navigate(['login']);
  }

  public ngOnDestroy() {
    this.cmos$.unsubscribe();
    this.member$.unsubscribe();
  }

  public async ipfsManager() {
    // Adding data to IPFS
    const node = await IPFS.create();

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
      this.userForm.get('kycData').setValue(this.kycData);
      // console.log(this.kycData);
    }
    // and can be used to get it again.
    // Getting data from IPFS
    // node = await IPFS.create();
    //
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

  public openInput() {
    document.getElementById('kycData').click();
  }

  public uploadFile(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.userForm.get('kycData').setValue(file);
    }
  }

  public readMyTxtFile(file) {
    // if (event.target.files.length > 0) {
    if (file.length > 0) {
      // const file = event.target.files;
      // if (file.length > 0) {
        // console.log(file); // You will see the file
        //
        const f = new Blob(file, {type: 'text/plain'});
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          console.log(text);
        };
        reader.readAsText(f);
      // }
    }
  }

  public onFileSelected(inputNode) {
    // const inputNode: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.kycData = e.target.result;
        console.log(this.kycData);
      };

      reader.readAsText(inputNode);
    }
  }

  public clear() {
    this.kycData = undefined;
    this.userForm.get('kycData').setValue(undefined);
  }

}
