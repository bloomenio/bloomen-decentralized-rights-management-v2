// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';

import * as fromAction from '@stores/mnemonic/mnemonic.actions';
import { Web3Service } from '@services/web3/web3.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('restore-account.component');

/**
 * Restore account page
 */
@Component({
  selector: 'blo-restore-account',
  templateUrl: './restore-account.component.html',
  styleUrls: ['./restore-account.component.scss']
})
export class RestoreAccountComponent implements OnInit, OnDestroy {

  public mnemonicForm: FormGroup;

  constructor(
    private router: Router,
    public fb: FormBuilder,
    private location: Location,
    private store: Store<any>,
    private web3Service: Web3Service,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  public ngOnInit() {
    this.mnemonicForm = this.fb.group({
      mnemonic: ['', [Validators.required]]
    });
  }

  public onRestore() {
    const randomSeed = this.mnemonicForm.get('mnemonic').value;
    if (this.web3Service.validateMnemonic(randomSeed)) {
      this.store.dispatch(new fromAction.AddMnemonic({ randomSeed }));
      this.router.navigate(['waiting-approve']);
    } else {
      this.snackBar.open(this.translate.instant('common.invalid_mnemonic'), null, {
        duration: 2000,
      });
    }
  }

  public doBack() {
    this.location.back();
  }

  public ngOnDestroy() {

  }


}
