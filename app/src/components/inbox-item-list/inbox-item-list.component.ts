// Basic
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { INBOX } from '@core/constants/inbox.constants';
import { ClaimModel } from '@core/models/claim.model';
import * as fromUserSelectors from '@stores/user/user.selectors';
import {first, map, skipWhile} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {UserModel} from '@models/user.model';
import {Store} from '@ngrx/store';
import {isUpperCase} from 'tslint/lib/utils';
import {currentUser, InboxComponent} from '@pages/inbox/inbox.component';
import {globalAllAssets, RepertoireEffects} from '@stores/repertoire/repertoire.effects';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import {AssetCardReadOnlyComponent} from '@components/asset-card-readOnly/asset-card-readOnly.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import * as fromRepertoireSelector from '@stores/repertoire/repertoire.selectors';
import {ShellComponent} from '@shell/shell.component';
import {AssetsApiService} from '@api/assets-api.service';
import * as assert from 'assert';
import {async} from '@angular/core/testing';
// import {globalFetchedInClaims} from '@pages/claims/claims.component';

export let globalFetched: any;
export let tempUrl: any;
export let once = false;

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
  private varSub: Subscription;
  private repEffLoading$: Subscription;
  private repEffLoading: boolean;
  public user: UserModel;
  public repertoire$: Observable<any[]>;
  public repertoireCount$: Observable<number>;
  // public fetched: any;

  constructor(
      public store: Store<any>,
      public inboxComponent: InboxComponent,
      public dialog: MatDialog,
      public router: Router,
      public assetsApiService: AssetsApiService,
      public repertoireEffects: RepertoireEffects
  ) { }

  public async ngOnInit() {
    this.inboxEnum = INBOX;
    this.claimType = ClaimModel.ClaimTypeEnum;
    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile(user => !user),
        first()
    ).subscribe((user) => {
      this.user = user;
    });

    // console.log('Variable: ', this.repertoireEffects.globalAllAssetsVariable);
    tempUrl = this.router.url;
    globalFetched = [];
    if (globalAllAssets === undefined && !once) {
      once = true;
      // console.log('globalAllAssets IS UNDEFINED');
      this.dialog.open(AssetCardReadOnlyComponent, {});
      this.assetsApiService.type = 'all';
      this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
      this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);

      // console.log('this.user.group is ', this.inboxComponent.user.groups);
      this.assetsApiService.groups = this.inboxComponent.user.groups;
      // console.log('this.assetsApiService.groups is ', this.assetsApiService.groups);

      this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
            filter: '',
            pageIndex: 0,
            pageSize: 300
          }
      ));
      // this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
      //     {filter: ''}));
      while (this.repertoireEffects.globalAllAssetsVariable === undefined) {
        await new Promise((res) => {
          // console.log('wait effects to load()');
          setTimeout(res, 1000);
        });
      }
      if (this.dialog.openDialogs) {
        this.dialog.closeAll();
      }
    }
    this.repEffLoading$ = this.repertoireEffects.loading$.subscribe((value) => {
      this.repEffLoading = value;
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
    // console.log('showAsset(): ', message);

    if (globalAllAssets === undefined) {
      alert('Information not loaded yet!\n\n' +
              'Please try now...');
      // Promise.resolve()
      //     .then(() => {
      //       this.router.navigate(['repertoire']);
      //     })
      //     .then(() => {
      //       this.router.navigate(['inbox']);
      //     });
    } else {
      let assetToShow;
      Promise.resolve('DONE')
          .then(async () => {
            // console.log('fetched initially: ', globalFetched);
            // console.log('globalFetched initially: ', globalFetched);
            if (globalFetched && globalFetched.filter((asset) => (asset.ISWC || asset.ISRC || asset.ISC) ===
                (message.claimData.ISRC || message.claimData.ISWC)).length > 0 ) {
              assetToShow = globalFetched.filter((asset) => (asset.ISWC || asset.ISRC || asset.ISC) ===
                  (message.claimData.ISRC || message.claimData.ISWC));
              // console.log('fetched.filter', assetToShow);
              this.dialog.open(AssetCardReadOnlyComponent, {});
            } else {
              this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                    filter: message.claimData.ISRC || message.claimData.ISWC,
                    pageIndex: 0,
                    pageSize: 10
                  }
              ));
              this.dialog.open(AssetCardReadOnlyComponent, {});
              // const oldVariable = this.repertoireEffects.globalAllAssetsVariable;
              // console.log('oldVariable: ', oldVariable);
              while (this.repertoireEffects.globalAllAssetsVariable.length > 1) {
                await new Promise((res) => {
                  // console.log('Variable: ', this.repertoireEffects.globalAllAssetsVariable);
                  setTimeout(res, 1000);
                  // console.log(this.dialog.openDialogs);
                });
                if (this.router.url !== tempUrl) {
                  break; // break if navigate to different page
                }
              }
              // console.log('tempUrl', tempUrl);
              if (this.router.url === tempUrl) {  // break if navigate to different page
                assetToShow = this.repertoireEffects.globalAllAssetsVariable;
                if (globalFetched === undefined) {
                  // console.log('undefined fetched');
                  globalFetched = new Object([]);
                }
                globalFetched.push(this.repertoireEffects.globalAllAssetsVariable[0]);
                // console.log('fetched: ', globalFetched);
                if (this.repertoireEffects.globalAllAssetsVariable.length <= 1) {
                  // Increase length; to stuck on "while + await new Promise" when questioning next 🔍🔍🔍🔍🔎"pageview" <mat-icon>.
                  this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                        filter: '',
                        pageIndex: 0,
                        pageSize: 10
                      }
                  ));
                }
              }
            }
          })
          .then(() => {
            // console.log('Variable: ', this.repertoireEffects.globalAllAssetsVariable);
            // console.log('assetToShow: ', assetToShow);
            if (this.router.url === tempUrl) {  // break if navigate to different page
              // console.log(this.dialog.openDialogs);
              if (this.dialog.openDialogs.length) {
                this.dialog.closeAll();
                this.dialog.open(AssetCardReadOnlyComponent, {
                  data: {
                    asset: assetToShow[0],
                    //  members: this.members
                  },
                  width: '560px'
                });
              }
            }
          });
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  public async ngOnDestroy() {
    if (this.repEffLoading$) {
      this.repEffLoading$.unsubscribe();
    }
  }
}
