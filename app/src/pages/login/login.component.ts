// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromAppActions from '@stores/application-data/application-data.actions';
import { MnemonicModel } from '@core/models/mnemonic.model';
import { THEMES } from '@core/constants/themes.constants';

const log = new Logger('login.component');


/**
 * Login page
 */
@Component({
  selector: 'blo-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    private store: Store<MnemonicModel>
  ) { }

  public ngOnInit() {

  }

  public ngOnDestroy() {

  }

  public onCreateAccount() {
    this.store.dispatch(new fromMnemonicActions.AddMnemonic());
    this.store.dispatch(new fromAppActions.ChangeTheme({ theme: THEMES.blue }));
    this.router.navigate(['user-form']);
  }

  public onRestoreAccount() {
    this.router.navigate(['restore-account']);
  }


}
