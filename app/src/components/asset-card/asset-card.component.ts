// Basic
import { Component, OnInit, Input } from '@angular/core';
import { AssetModel } from '@core/models/assets.model';
import { MatDialog, MatExpansionPanel } from '@angular/material';

import { MemberModel } from '@core/models/member.model';
import { Logger } from '@services/logger/logger.service';

import { ClaimModel } from '@core/models/claim.model';
import { SoundDialogComponent } from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import { MusicalDialogComponent } from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import { ClaimsContract } from '@core/core.module';
import { ASSET } from '@core/constants/assets.constants';
import { Subscription, interval, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { skipWhile, takeWhile, map, switchMap, first } from 'rxjs/operators';
import * as fromUserSelectors from '@stores/user/user.selectors';
import { UserModel } from '@core/models/user.model';
import { userInfo } from 'os';

const log = new Logger('assets-card.component');

/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-asset-card',
  templateUrl: 'asset-card.component.html',
  styleUrls: ['asset-card.component.scss']
})
export class AssetCardComponent implements OnInit {

  public expanded: Boolean;
  public user: UserModel;

  @Input() public asset: any;
  @Input() public members: MemberModel[];

  private user$: Subscription;

  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
    private claimsContract: ClaimsContract
  ) { }

  public ngOnInit() {
    this.expanded = false;
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
      skipWhile(user => !user),
      first()
    ).subscribe((user) => {
      this.user = user;
    });
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

  public claim() {
    let dialog: any;

    switch (this.asset.type) {

      case ASSET.ASSET_TYPE.MUSICAL_WORK:
        dialog = this.dialog.open(MusicalDialogComponent, {
          data: {
            claim: {
              memberOwner: this.user.memberId,
              creationDate: new Date().getTime(),
              claimType: ClaimModel.ClaimTypeEnum.MUSICAL_WORK,
              status: ClaimModel.StatusClaimEnum.PENDING,
              messageLog: [],
              claimData: {
                ISWC: this.asset.ISWC,
                title: this.asset.originalTitle
              }
            },
            members: this.members,
            disableMemberEdit: false,
            isEditable: true
          },
          width: '900px',
          height: '810px'
        });
        break;

      case ASSET.ASSET_TYPE.SOUND_RECORDING:
        dialog = this.dialog.open(SoundDialogComponent, {
          data: {
            claim: {
              memberOwner: this.user.memberId,
              creationDate: new Date().getTime(),
              claimType: ClaimModel.ClaimTypeEnum.SOUND_RECORDING,
              status: ClaimModel.StatusClaimEnum.PENDING,
              messageLog: [],
              claimData: {
                ISRC: this.asset.ISRC,
                title: this.asset.title
              }
            },
            members: this.members,
            disableMemberEdit: false,
            isEditable: true
          },
          width: '900px',
          height: '510px'
        });
        break;

      default:
        break;
    }

    dialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.claimsContract.addClaim(result);
      }
    });
  }
}
