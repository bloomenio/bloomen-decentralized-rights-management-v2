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
    public repertoireCount$: Observable<number>;
    public countAssets: number;
    public members$: Subscription;
    public members: MemberModel[];
    public member: MemberModel;
    // private user$: Subscription;
    // public user: UserModel;
    public member$: Subscription;
    public currentGroup: string;
    private page$: Subscription;
    public csvRecords: any[] = [];
    public header = false;
    private registrationForm: any;
    // public type: string;

    constructor(
        private store: Store<any>, // AssetModel
        public snackBar: MatSnackBar,
        public router: Router,
        public fb: FormBuilder,
        public assetsApiService: AssetsApiService,
        public inboxComponent: InboxComponent,
        public shellComponent: ShellComponent
  ) { }

    public async ngOnInit() {
      this.assetsApiService.type = 'all';
      this.countAssets = 0;
      this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
      this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);
      // this.members = this.inboxComponent.member;
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

      this.registrationForm = new FormGroup({ type: new FormControl() });
      this.registrationForm = this.fb.group({ type: ['all'] });

      if (this.shellComponent.user === undefined) {
        this.router.navigate(['inbox']);
      }
      // console.log('this.user.group is ', this.shellComponent.user.groups);
      this.assetsApiService.groups = this.shellComponent.user.groups;
      // console.log('this.assetsApiService.groups is ', this.assetsApiService.groups);

      this.filter = '';
      this.store.dispatch(new fromRepertoireActions.RepertoireSearch({
                  filter: '',
                  pageIndex: 0,
                  pageSize: 300
              }
          ));
      this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
          {filter: ''}));

      // this.newMessagesInterval$ = interval(5000).subscribe(() => {
      // FOR "NEW MESSAGES" INBOX NOTIFICATION.
        // tslint:disable-next-line:no-life-cycle-call
      this.inboxComponent.ngOnInit();
      if (!this.shellComponent.newMessagesGet()) {
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
      this.assetsApiService.type = this.registrationForm.get('type').value;
      this.getAssets();
  }

    public ngAfterViewInit() {
    this.page$ = this.paginator.page.pipe(
      tap(() => this.getAssets())
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
    // }
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
  }

}
