// Basic
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { Store } from '@ngrx/store';

import { MatSnackBar, MatPaginator } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';

import { Subscription, Observable } from 'rxjs';
import { AssetModel } from '@core/models/assets.model';
import { tap } from 'rxjs/operators';

import * as fromRepertoireSelector from '@stores/repertoire/repertoire.selectors';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';

import * as fromMemberSelectors from '@stores/member/member.selectors';
import { MemberModel } from '@core/models/member.model';


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

  public assetMock: AssetModel;
  public filter: string;
  public repertoire$: Observable<AssetModel[]>;
  public repertoireCount$: Observable<number>;
  public countAssets: number;

  public members$: Subscription;
  public members: MemberModel[];

  private page$: Subscription;

  constructor(
    private store: Store<AssetModel>,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  public ngOnInit() {
    this.countAssets = 0;
    this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
    this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);
    this.members$ = this.store.select(fromMemberSelectors.selectAllMembers).subscribe((members) => {
      this.members = members;
    });
  }

  public ngAfterViewInit() {
    this.page$ = this.paginator.page.pipe(
      tap(() => this.getAssets())
    ).subscribe();
  }

  private getAssets() {
    if (this.filter.length === 0 ) {
      this.store.dispatch(new fromRepertoireActions.RemoveRepertoire());
    } else {
      this.store.dispatch(new fromRepertoireActions.RepertoireSearch(
        {filter: this.filter,
         pageIndex: this.paginator.pageIndex,
         pageSize: this.paginator.pageSize }));
      this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
          {filter: this.filter}));
    }
  }

  public applyFilter(filterValue: string) {
    this.filter = filterValue;
    this.getAssets();
  }

  public ngOnDestroy() {
    this.page$.unsubscribe();
    this.store.dispatch(new fromRepertoireActions.RemoveRepertoire());
  }

}
