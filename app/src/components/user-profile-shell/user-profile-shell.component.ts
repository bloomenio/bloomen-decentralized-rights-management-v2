// Basic
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MnemonicModel } from '@core/models/mnemonic.model';

import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromUserActions from '@stores/user/user.actions';
import * as fromMnemonicSelectors from '@stores/mnemonic/mnemonic.selectors';
import * as fromApplicationDataActions from '@stores/application-data/application-data.actions';
import { ClipboardService } from 'ngx-clipboard';
import { THEMES } from '@core/constants/themes.constants';

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-user-profile-shell',
  templateUrl: 'user-profile-shell.component.html',
  styleUrls: ['user-profile-shell.component.scss']
})
export class UserProfileShellComponent implements OnInit {

  private mnemonic: string;

  constructor(
    private router: Router,
    private store: Store<MnemonicModel>,
    private clipboard: ClipboardService
  ) { }

  public ngOnInit() {
    this.store.select(fromMnemonicSelectors.getMnemonic).subscribe((mnemonic) => {
      this.mnemonic = mnemonic;
    });
  }

  public doLogout() {

    this.store.dispatch(new fromMnemonicActions.RemoveMnemonic());
    this.store.dispatch(new fromUserActions.RemoveUser());
    this.store.dispatch(new fromApplicationDataActions.ChangeTheme({ theme: THEMES.blue }));

    this.router.navigate(['login']);
  }

  public doCopyMnemonic() {
    this.clipboard.copyFromContent(this.mnemonic);
  }

}
