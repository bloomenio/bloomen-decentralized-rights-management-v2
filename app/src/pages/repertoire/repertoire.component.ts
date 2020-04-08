// Basic
import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatPaginator } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';
import {Subscription, Observable, pipe, interval} from 'rxjs';
import { AssetModel } from '@core/models/assets.model';
import {filter, first, map, skipWhile, tap} from 'rxjs/operators';
import * as fromRepertoireSelector from '@stores/repertoire/repertoire.selectors';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import { MemberModel } from '@core/models/member.model';
import {ShellComponent} from '@shell/shell.component';
import {InboxComponent, unreadMessages, currentUser} from '@pages/inbox/inbox.component';
import {AssetsApiService} from '@api/assets-api.service';
import * as fromUserActions from '@stores/user/user.actions';
import {MemberContract} from "@services/web3/contracts";

const log = new Logger('repertoire.component');


/**
 * Repertoire page
 */
@Component({
  selector: 'blo-repertoire',
  templateUrl: './repertoire.component.html',
  styleUrls: ['./repertoire.component.scss']
})
export class RepertoireComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) public paginator: MatPaginator;
    @Input() public repertoire: any;
    public newMessagesInterval$: any;
    public uploadedCSV2JSON: any;
    public assetMock: AssetModel;
    public filter: string;
    public repertoire$: Observable<any[]>; // AssetModel
    public repertoireLengthSub: Subscription;
    public repertoireCount$: Observable<number>;
    public repertoireCount$Sub: Subscription;
    public countAssets: number;
    public members$: Subscription;
    public members: MemberModel[];
    public member: MemberModel;
    public member$: Subscription;
    public currentGroup: string;
    private page$: Subscription;
    public csvRecords: any[] = [];
    public header = false;
    private bulletForm: any;
    public count: number;
    public lastPageSize: number;
    public lastPageIndex: number;
    public prevPageIndex: number;
    public prevAssetsApiServicePage: number;
    public allPagesSize: number;
    public allAssets: any[];
    public pageAssets: any[];

    constructor(
        private store: Store<any>, // AssetModel
        public snackBar: MatSnackBar,
        public router: Router,
        public fb: FormBuilder,
        public assetsApiService: AssetsApiService,
        public inboxComponent: InboxComponent,
        public shellComponent: ShellComponent
        // @Inject(AssetsApiService) public assetsApiServiceWhole
    ) { }

    public async ngOnInit() {
      this.assetsApiService.type = 'all';
      this.paginator.pageIndex = 0;
      this.assetsApiService.page = this.paginator.pageIndex;
      this.paginator.pageSize = 10;
      this.count = this.paginator.pageSize;
      this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
      this.repertoireLengthSub = this.repertoire$
          .subscribe((assets) => {
              // console.log('page from Whole: ', this.assetsApiServiceWhole.page = this.paginator.pageIndex);
              this.assetsApiService.page = this.paginator.pageIndex;
              // console.log('pageIndex=', this.paginator.pageIndex);
              // console.log('API page=', this.assetsApiService.page);
              this.count = this.count + assets.length;
              // console.log('COUNT= ', this.count);
              this.allAssets = assets;
          // console.log(assets);
              if (assets.length > this.paginator.pageSize) {
                  assets = [];
                  for (let i = 0; i < this.paginator.pageSize; i++) {
                      // console.log(this.allAssets[i]);
                      const pageIndex = this.paginator.pageIndex; // % 2 ? 1 : 0;
                      if (pageIndex * this.paginator.pageSize + i < this.allAssets.length) {
                          assets.push(this.allAssets[pageIndex * this.paginator.pageSize + i]);
                      }
                  }
              }
              this.pageAssets = assets;
              // console.log(this.pageAssets);
          });
      this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);
      this.repertoireCount$Sub = this.repertoireCount$.subscribe((count) => {
          // this.allPagesSize = Math.floor(count / this.paginator.pageSize) * this.paginator.pageSize;
          // this.lastPageIndex = Math.floor(assets.length / this.paginator.pageSize);
          // this.lastPageSize = assets.length - this.lastPageIndex * this.paginator.pageSize || this.paginator.pageSize;
          // console.log('assets.length=', assets.length, ' pageIndex=', this.paginator.pageIndex,
          // ' pageSize=', this.paginator.pageSize, ' lastPageSize=', this.lastPageSize,
          // ' lastPageIndex=', this.lastPageIndex);
      });
      this.member$ = this.store.select(fromMemberSelectors.getCurrentMember)
          .subscribe((member) => {
          if (member) {
              this.member = member;
              // this.currentGroup = member.group;
              // console.log('CURRENT MEMBER is  ', this.member);
              // console.log('INBOXCOMPONENT MEMBER is  ', this.inboxComponent.member);
          }
      });
      // this.assetsApiService.group = this.currentGroup;

      this.bulletForm = new FormGroup({ type: new FormControl() });
      this.bulletForm = this.fb.group({ type: ['all'] });

      if (this.shellComponent.user === undefined) {
        this.router.navigate(['inbox']);
      }
      // console.log('this.user.group is ', this.shellComponent.user.groups);
      this.assetsApiService.groups = this.shellComponent.user.groups;
      // console.log('this.assetsApiService.groups is ', this.assetsApiService.groups);

      this.filter = '';
      this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                  filter: this.filter,
                  pageIndex: this.paginator.pageIndex,
                  pageSize: this.paginator.pageSize
              }
          ));
      this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
          {filter: this.filter}));
      // ++this.assetsApiService.page;

      // this.newMessagesInterval$ = interval(5000).subscribe(() => {
      // FOR "NEW MESSAGES" INBOX NOTIFICATION.
        // tslint:disable-next-line:no-life-cycle-call
      this.inboxComponent.ngOnInit();
      if (!this.shellComponent.newMessagesGet() && this.inboxComponent.inbox) {
          this.inboxComponent.checkNewMessages();
      }
      // tslint:disable-next-line:no-life-cycle-call
      this.shellComponent.ngOnInit();
      // });
      // this.currentMember = this.inboxComponent.currentMember;
      // console.log('CURRENT MEMBER group is ', this.currentMember.group);
      this.shellComponent.unreadMessages = unreadMessages;
      // in order to update groups from newly submitted from its Super User
  }

    public checkSource() {
      this.assetsApiService.type = this.bulletForm.get('type').value;
      this.getAssets();
  }

    public ngAfterViewInit() {
    this.page$ = this.paginator.page.pipe(
      tap(() => {
          this.assetsApiService.page = this.paginator.pageIndex;
          this.getAssets();
      })
    ).subscribe();
    }

    public getAssets() {
    // if (this.filter.length === 0 ) {
      // this.store.dispatch(new fromRepertoireActions.RemoveRepertoire());
    // } else {
      this.store.dispatch(new fromRepertoireActions.RepertoireSearch(
        {filter: this.filter,
         pageIndex: this.paginator.pageIndex,
         pageSize: this.paginator.pageSize }));
      this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
          {filter: this.filter}));
      this.assetsApiService.page = this.paginator.pageIndex;
      // console.log('THIS PAGINATOR: ', this.filter, this.paginator.pageIndex, this.paginator.pageSize);
    }

    public applyFilter(filterValue: string) {
    this.filter = filterValue;
    this.getAssets();
  }

    public ngOnDestroy() {
    this.page$.unsubscribe();
    if (this.member$) {
        this.member$.unsubscribe();
    }
    this.store.dispatch(new fromRepertoireActions.RemoveRepertoire());
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
    if (this.repertoireCount$Sub) {
      this.repertoireCount$Sub.unsubscribe();
    }
    if (this.repertoireLengthSub) {
      this.repertoireLengthSub.unsubscribe();
    }
  }

}
