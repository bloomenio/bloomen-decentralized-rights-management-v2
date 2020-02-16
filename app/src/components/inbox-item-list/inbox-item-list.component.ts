// Basic
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { INBOX } from '@core/constants/inbox.constants';
import { ClaimModel } from '@core/models/claim.model';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {first, skipWhile} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {UserModel} from '@models/user.model';
import {Store} from '@ngrx/store';
import {isUpperCase} from 'tslint/lib/utils';
import {InboxComponent} from '@pages/inbox/inbox.component';
import {globalAllAssets} from '@stores/repertoire/repertoire.effects';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';


/**
 * Home-options-shell component
 */
@Component({
  selector: 'blo-inbox-item-list',
  templateUrl: 'inbox-item-list.component.html',
  styleUrls: ['inbox-item-list.component.scss']
})
export class InboxItemListComponent implements OnInit {

  @Input() public message: any;
  @Input() public isActive: boolean;
  @Input() public isUnread: boolean;
  @Output() public readonly messageSelected = new EventEmitter();
  public inboxEnum: object;
  public claimType: any;
  private user$: Subscription;
  public user: UserModel;

  constructor(
      public store: Store<any>,
      public inboxComponent: InboxComponent,
      public dialog: MatDialog,
      public router: Router
  ) { }

  public ngOnInit() {
    this.inboxEnum = INBOX;
    this.claimType = ClaimModel.ClaimTypeEnum;
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      this.user = user;
    });
  }

  public onClickMessage() {
    if (this.message.read !== true) {
      this.message.read = true;
      this.inboxComponent.markAsRead(this.message.creationDate, (this.message.claimId ? this.message.claimId : this.message.firstName));
      // this.message.push({ 'read': true});  // The message was just read.
      // console.log('The message was just read.');
    }
    // console.log(this.message[this.message.length - 1]);
    // console.log('message');
    // console.log(this.message);
    this.messageSelected.emit(this.message);
  }

  public showAsset(message: any) {
    console.log('SHOWASSET');
    console.log(message);

    if (globalAllAssets === undefined) {
      alert('Bloomen Decentralized Management App:\n\n\nPlease click your \'Repertoire Tab\'!\n\n' +
              'In order to fetch the appropriate information on assets.');
      // Promise.resolve()
      //     .then(() => {
      //       this.router.navigate(['repertoire']);
      //     })
      //     .then(() => {
      //       this.router.navigate(['inbox']);
      //     });
    } else {
      Promise.resolve('DONE')
          .then(async () => {
            const temp = globalAllAssets;
            this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                  filter: message.claimData.title,
                  pageIndex: 0,
                  pageSize: 300
                }
            ));
            // while (globalAllAssets.length === temp.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // }
            // console.log(globalAllAssets);
          })
          .then(() => {
            if (globalAllAssets) {
              const assetToShow = globalAllAssets
                  .filter((asset) => (asset.ISWC || asset.ISRC) === (message.claimData.ISRC || message.claimData.ISWC));
              console.log(assetToShow);
              this.dialog.open(AssetCardReadOnlyComponent, {
                data: {
                  asset: assetToShow[0],
                  // members: this.members
                },
                // width: '200px'
              });
            }
          });
    }
  }
}
