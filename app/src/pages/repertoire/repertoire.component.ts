// Basic
import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import { Store } from '@ngrx/store';

import { MatSnackBar, MatPaginator } from '@angular/material';
import { Logger } from '@services/logger/logger.service';
import { Router } from '@angular/router';

import {Subscription, Observable, pipe, interval} from 'rxjs';
import { AssetModel } from '@core/models/assets.model';
import { filter, map, tap } from 'rxjs/operators';

import * as fromRepertoireSelector from '@stores/repertoire/repertoire.selectors';
import * as fromRepertoireActions from '@stores/repertoire/repertoire.actions';

import * as fromMemberSelectors from '@stores/member/member.selectors';
import { MemberModel } from '@core/models/member.model';
import {AssetCardComponent} from '@components/asset-card/asset-card.component';
// import { NgxCsvParser } from 'ngx-csv-parser';
// import { NgxCSVParserError } from 'ngx-csv-parser';
import * as Papa from 'papaparse';
import {ShellComponent} from '@shell/shell.component';
import {InboxComponent} from '@pages/inbox/inbox.component';
import {AssetsApiService} from '@api/assets-api.service';

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

  private page$: Subscription;

  public csvRecords: any[] = [];
  public header = false;
  private registrationForm: any;
  // public type: string;

  constructor(
    private store: Store<any>, // AssetModel
    public snackBar: MatSnackBar,
    public router: Router,
    public assetCardComponent: AssetCardComponent,
    public inboxComponent: InboxComponent,
    public shellComponent: ShellComponent,
    public fb: FormBuilder,
    public assetsApiService: AssetsApiService
  ) { }

  public async ngOnInit() {
      this.assetsApiService.type = 'all';
      this.countAssets = 0;
      this.repertoire$ = this.store.select(fromRepertoireSelector.selectRepertoire);
      this.repertoireCount$ = this.store.select(fromRepertoireSelector.getRepertoireCount);
      this.members$ = this.store.select(fromMemberSelectors.selectAllMembers)
          .subscribe((members) => { this.members = members; });

      // this.registrationForm = this.fb.group({
      //     type: ['all']
      // });

      this.registrationForm = new FormGroup({
          type: new FormControl()
      });
      this.registrationForm = this.fb.group({
          type: ['all']
      });

      this.store.dispatch(new fromRepertoireActions.RepertoireSearch(
      {filter: '',
       pageIndex: 0,
       pageSize: 300 }
      ));
      this.store.dispatch(new fromRepertoireActions.RepertoireSearchCount(
        {filter: ''}));

      console.log('MEMBER: ', this.members[0].name);

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
  }

  public checkSource() {
      // console.log('TYPE: ', this.registrationForm.get('type').value);
      // this.type = this.registrationForm.get('type').value;
      // console.log(this.type);
      this.assetsApiService.type = this.registrationForm.get('type').value;
      this.getAssets();
  }

  public filteredType(type: string) {
      this.filter = type;
      const local =

          this.repertoire$
          .pipe(
              // filter(asset => asset[_].ISWC !== 'undefined')
          );
      if (local) {
      //     local.unsubscribe();
      //     console.log(local);
      }
      return this.repertoire$;
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
    this.store.dispatch(new fromRepertoireActions.RemoveRepertoire());
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
  }

  public uploadFile(event) {
    const file = event.target.files;
    if (file.length > 0) {
        console.log(file); // You will see the file
      // Papaparse


      // let formData: FormData = new FormData();
      // formData.append('file', file, file.name);
      // console.log('formData');
      // console.log('formData');

      // Parse the file you want to select for the operation along with the configuration
      // @ts-ignore
      // const ngxCsvParser: NgxCsvParser = NgxCsvParser;
      // ngxCsvParser.parse(file[0], { header: this.header, delimiter: ',' })
      //       .pipe().subscribe((result: Array<any>) => {
      //           console.log('Result: \n', result);
      //           this.csvRecords = result;
      //       }, (error: NgxCSVParserError) => {
      //           console.log('Error', error);
      //       });
      // this.uploadedCSV2JSON = this.csvRecords;

        const f = new Blob(file, {type: 'text/plain'});
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            console.log('CSV file:\n', (text as string).substring(0, 1000) + '...');
            // convert text to json here
            // const results = [];
            // this.uploadedCSV2JSON = this.csvJSON(text);
            // Papaparse
            // const papa = Papa.parse(text);
            console.log('Papa');
            // console.log(papa);
            // this.uploadedCSV2JSON = papa;
            // console.log('JSON file:\n', this.uploadedCSV2JSON);
            const papa = Papa.parse(text, {
                transform: function (value) {
                    try {
                        return JSON.parse(value);
                    } catch (err) {
                        return value;
                    }
                }
            });
            console.log('CSV.DATA PAPAPARSE:');
            console.log(this.csvJSON(papa.data));
            this.uploadedCSV2JSON = this.csvJSON(papa.data);
              // tslint:disable-next-line:no-life-cycle-call
            this.assetCardComponent.ngOnInit();
            this.assetCardComponent.repertoireBulkUpload(this.uploadedCSV2JSON);
        };
        reader.readAsText(f);
    }
  }

  public csvJSON(csv) {
      const result = [];
      const line = csv;
      const headers = line[0];
      for (let i = 1; i < line.length; i++) {
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
              const currentline = line[i];
              // console.log(currentline);
              if (j === 2 || j === 3) {
                  obj[headers[j]] = Date.parse(currentline[j]).toString();
              } else {
                  obj[headers[j]] = (currentline[j]).toString();
              }
          }
          result.push(obj);
      }
      // return result; //JavaScript object
      return JSON.stringify(result); // JSON
  }
}
