// Basic
import {Component, Inject, Input, OnInit} from '@angular/core';
import {MatDialog, MatExpansionPanel} from '@angular/material';
import {MemberModel} from '@core/models/member.model';
import {Logger} from '@services/logger/logger.service';
import {ClaimsContract} from '@core/core.module';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {first, reduce, skipWhile} from 'rxjs/operators';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {UserModel} from '@core/models/user.model';
import { ROLES } from '@core/constants/roles.constants';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

const log = new Logger('assets-card.component');

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-asset-card-read-only',
  templateUrl: 'asset-card-readOnly.component.html',
  styleUrls: ['asset-card-readOnly.component.scss']
})
export class AssetCardReadOnlyComponent implements OnInit {

  public cmos: string[];
  public roles: object;
  public member$: Subscription;
  public expanded: Boolean = true;
  public user: UserModel;

  @Input() public members: MemberModel[];

  private user$: Subscription;

  constructor(
    private store: Store<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private claimsContract: ClaimsContract
  ) { }

  public ngOnInit() {
    this.roles = ROLES;
    this.expanded = true;
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
      skipWhile(user => !user),
      first()
    ).subscribe((user) => {
      this.user = user;
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  public ngOnDestroy() {
    if (this.user$) {
      this.user$.unsubscribe();
    }
  }

  public expandPanel(matExpansionPanel: MatExpansionPanel, event: Event) {
    event.stopPropagation();

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.close();
    }
  }

  private _isExpansionIndicator(target: any): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (target.classList && target.classList.contains(expansionIndicatorClass));
  }

  public changeStateAccordion($event: Event) {
    $event.stopPropagation();
    this.expanded = !this.expanded;
  }

  public async delay(ms: number) {    // await this.delay(500);
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
