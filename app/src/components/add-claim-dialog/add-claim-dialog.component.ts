import {AfterViewInit, Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import * as fromCmosSelectors from '@stores/cmos/cmos.selectors';
import * as fromMemberSelectors from '@stores/member/member.selectors';

import {Logger} from '@services/logger/logger.service';

import {ClaimModel} from '@core/models/claim.model';
import {COUNTRIES} from '@constants/countries.constants';
import {map, startWith, tap} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MemberModel} from '@models/member.model';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import StatusClaimEnum = ClaimModel.StatusClaimEnum;
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;
import * as fromClaimActions from '@stores/claim/claim.actions';
import {ClaimsContract} from '@services/web3/contracts';
import {ClaimsDataSource} from '@pages/claims/claims.datasource';
import {ASSET} from '@constants/assets.constants';
import {MusicalDialogComponent} from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {AddSoundRecordingComponent} from '@components/add-sound/add-sound-recording.component';
import {AddMusicalWorkComponent} from '@components/add-musical/add-musical-work.component';
import {MatPaginator} from '@angular/material/paginator';


const log = new Logger('add-claim-dialog');

@Component({
  selector: 'blo-add-claim-dialog',
  templateUrl: './add-claim-dialog.component.html',
  styleUrls: ['./add-claim-dialog.component.scss']
})
export class AddClaimDialogComponent implements OnInit {

  public usersPageNumber: number;
  @ViewChild(MatPaginator) public paginator: MatPaginator;
  // private claimTypeToClaim: String;
  public dataSource: ClaimsDataSource;
  public claimForm: FormGroup;
  public useTypesAll: string[] = ['Public Performance', 'Airlines', 'Radio Broadcasting', 'Radio Dubbing', 'TV Broadcasting'];

  public countries: string[];
  public countriesAll: any;
  public filteredCountries: Observable<string[]>;
  public messages: object[];

  public member$: Subscription;
  public member: MemberModel;
  // @Input() public typeToClaim: String = '1';
  public typeForm = new FormGroup({
    typeToClaim: new FormControl()
  });

  public separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('countryInput') public countryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') public matAutocomplete: MatAutocomplete;

  constructor(
      private dialog: MatDialog,
      public dialogRef: MatDialogRef<AddClaimDialogComponent>,
      private fb: FormBuilder,
      public store: Store<any>,
      private claimsContract: ClaimsContract
  ) { }

  public ngOnInit() {
    this.typeForm = this.fb.group({
      typeToClaim: ['', [Validators.required]]
    });
  }

  public claim() {

    let dialog: any;
    console.log(this.typeForm.get('typeToClaim').value);
    switch (this.typeForm.get('typeToClaim').value) {
      case 'ISWC':
        dialog = this.dialog.open(AddMusicalWorkComponent, {
          width: '900px',
          height: '810px'
        });
        break;

      case 'ISRC':
        dialog = this.dialog.open(AddSoundRecordingComponent, {
          width: '900px',
          height: '510px'
        });
        break;
      //
      default:
        break;
    }

    dialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        this.claimsContract.addClaim(result).then(() => {
          this.loadClaimsPage();
        });
      }
    });
  }

  public loadClaimsPage() {
    this.dataSource.loadClaims(
        '',
        'asc',
        this.paginator.pageIndex,
        this.paginator.pageSize
    );
  }

  // public ngAfterViewInit() {
  //
  //   // 'AfterViewInit' must be 'implemented' by the exported class
  //   this.claimsContract.getClaimsCountByMemId().then((count) => {
  //     this.usersPageNumber = count;
  //   });
  //
  //   this.paginator.page.pipe(
  //       tap(() => this.loadClaimsPage())
  //   ).subscribe();
  // }
}
