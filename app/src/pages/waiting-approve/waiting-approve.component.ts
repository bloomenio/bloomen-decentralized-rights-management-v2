// Basic
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import { interval, Subscription, from } from 'rxjs';
import { Store } from '@ngrx/store';

import { UserContract } from '@services/web3/contracts/user/userContract';
import { UserModel } from '@core/models/user.model';
import { Web3Service } from '@services/web3/web3.service';

import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromUserActions from '@stores/user/user.actions';
import * as fromUserSelector from '@stores/user/user.selectors';
import { skipWhile } from 'rxjs/operators';
import { ROLES } from '@core/constants/roles.constants';

const log = new Logger('waiting-approve.component');


/**
 * Waiting approve page
 */
@Component({
  selector: 'blo-waiting-approve',
  templateUrl: './waiting-approve.component.html',
  styleUrls: ['./waiting-approve.component.scss']
})
export class WaitingApproveComponent implements OnInit, OnDestroy {

  private interval$: Subscription;

  public user: UserModel;

  constructor(
    public snackBar: MatSnackBar,
    public router: Router,
    public store: Store<any>,
    private userContract: UserContract,
    private web3Service: Web3Service,
    private ngZone: NgZone
  ) { }

  public ngOnInit() {

    this.store.select(fromUserSelector.getUser)
        .pipe(skipWhile((user) => !user)).subscribe((user) => {
      if (user) {
        const status = Number(user.status); // parseInt(user.status, 10);
        if (status === 2 || user.role === ROLES.SUPER_USER) {
          this.ngZone.run(() => {
            this.router.navigate(['inbox'])
                .then(() => {
                  // window.location.reload();
                });
          });
        }
      }
    });

    this.web3Service.ready(async () => {
      this.interval$ = interval(1000).subscribe(async () => {
        this.userContract.getMe().then((user) => {
          if (user.firstName.length > 0) {
            this.user = user;
            // console.log(user);
            const status = Number(user.status); // parseInt(user.status, 10);
            if (status === 2 || user.role === ROLES.SUPER_USER) {
              this.store.dispatch(new fromUserActions.AddUser());
            } else if (status === 0) {
              log.debug('user not found');
              this.store.dispatch(new fromMnemonicActions.RemoveMnemonic());
              this.store.dispatch(new fromUserActions.RemoveUser());
              this.ngZone.run(() => {
                this.router.navigate(['rejected-user']);
              });
            }
          }
          if (this.user) {
            console.log(this.user.owner);
          }
        }, (error) => {
          log.debug('waiting user...');
        });
      });
    });
  }

  public ngOnDestroy() {
    if (this.interval$) {
      this.interval$.unsubscribe();
    }
  }


}
