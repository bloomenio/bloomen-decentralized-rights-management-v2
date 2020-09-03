import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromSelectors from '@stores/application-data/application-data.selectors';
import * as fromUserSelectors from '@stores/user/user.selectors';
import * as fromMemberSelectors from '@stores/member/member.selectors';
import { ApplicationDataStateModel } from '@core/models/application-data-state.model';
import { BloButtonsHostDirective } from '@directives/shell-dapp-options.directive';
import { BloBackButtonHostDirective } from '@directives/shell-back-button.directive';
import { BackButtonShellComponent } from '@components/back-button-shell/back-button-shell.component';
import { Router, NavigationEnd, ActivatedRoute, Route } from '@angular/router';
import { filter, map, mergeMap, skipWhile, first, delay } from 'rxjs/operators';
import { Logger } from '@services/logger/logger.service';
import { ObservableMedia } from '@angular/flex-layout';
import { ROLES } from '@core/constants/roles.constants';
import { MatDialog } from '@angular/material';
import { AddMemberDialogComponent } from '@components/add-member-dialog/add-member-dialog.component';
import { UserModel } from '@core/models/user.model';
import {interval, range, Subscription} from 'rxjs';
import * as Papa from 'papaparse';
import {AssetCardComponent} from '@components/asset-card/asset-card.component';
import {ClaimsDataSource} from '@pages/claims/claims.datasource';
import {FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import {ClaimsContract, UserContract} from '@services/web3/contracts';
import {ApplicationDataDatabaseService} from '@db/application-data-database.service';
import {APPLICATION_DATA_CONSTANTS} from '@constants/application-data.constants';
import * as fromMemberActions from '@stores/member/member.actions';
import {MemberModel} from '@models/member.model';
import {version, build} from './../../package.json';
import {ClaimModel} from '@models/claim.model';
import ClaimTypeEnum = ClaimModel.ClaimTypeEnum;

export let newMessagesE: boolean;

const log = new Logger('blo-shell');

@Component({
  selector: 'blo-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

  public unreadMessages: number;
  public uploadedCSV2JSON: any;
  public newMessagesInterval$: any;
  public imgToolbar: string;
  public backgroundImage: string;
  public powered: boolean;
  public userName: string;
  public user: UserModel;
  public currentMember: MemberModel;
  public userInitials: string;
  public roles: object;
  public theme$: Subscription;
  public user$: Subscription;
  public member$: Subscription;
  public currentPageRoute: string;
  public allowTransactionSubmissions: boolean;
  public price: number;
  public version = version;
  public copyright = build.copyright;
  public csvForm: FormGroup;

  @ViewChild(BloButtonsHostDirective) public bloButtons: BloButtonsHostDirective;
  @ViewChild(BloBackButtonHostDirective) public bloBackButton: BloBackButtonHostDirective;

  public claimType: any;

  // For Refresh Claims page.
  public dataSource: ClaimsDataSource;
  private event: any;
  private insertedClaimsCount: number;
  private maxInsertedClaimsCount: number;
  public chunks: any[];
  public lastChunk: any;
  public lastToSubmitClaimFromChunk: number;
  public count: any;
  public lineOffset: number;
  public objs: any;
  public claimsArray: any[];
  private claimsToResubmit: any[];
  private firstDiv: number;
  private secondDiv: number;

  constructor(
    private titleService: Title,
    private store: Store<ApplicationDataStateModel>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private media: ObservableMedia,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public assetCardComponent: AssetCardComponent,
    private matDialog: MatDialog,
    public claimsContract: ClaimsContract,
    public userContract: UserContract,
    private applicationDatabaseService: ApplicationDataDatabaseService,
    public fb: FormBuilder
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
    // this.newMessagesInterval$ = this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     // Trick the Router into believing it's last link wasn't previously loaded
    //     this.router.navigated = false;
    //   }
    // });
  }

  public async ngOnInit() {
    this.roles = ROLES;
    // this.csvForm = this.fb.group({
    //   csv: [undefined, [Validators.required]]
    // });
    // this.csvForm = new FormGroup({
    //   firstName: new FormControl()
    // });

    this.theme$ = this.store.select(fromSelectors.getTheme).subscribe((themeObv) => {
      this._themeChanges(themeObv);
    });

    this.user$ = this.store.select(fromUserSelectors.getUser).pipe(
        skipWhile((user) => !user)
    ).subscribe((user) => {
      if (user) {
        this.user = user;
        this.userName = `${user.firstName} ${user.lastName}`;
        const initials = this.userName.match(/\b\w/g) || [];
        this.userInitials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

        if (user.role === ROLES.SUPER_USER) {
          this.imgToolbar = './assets/logo_bloomen_white.png';
          this.powered = false;
        } else {
          this.powered = true;
        }
      }
    });

    this.member$ = this.store.select(fromMemberSelectors.getCurrentMember)
        .pipe(skipWhile((currentMember) => !currentMember))
        .subscribe((currentMember) => {
          if (currentMember) {
            this.imgToolbar = currentMember.logo;
            this.currentMember = currentMember;
          }
        });

    this.findChildRoute(this.activatedRoute).data.subscribe(event => {
      this.loadAuxiliarOptions(event);
      this.loadBackButton(event);
      this.currentPageRoute = event.title;
    });

    this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
    ).subscribe((event) => {
      this.loadAuxiliarOptions(event);
      this.loadBackButton(event);
    });
    // console.log('SHELL COMPONENT says newMessagesE: ', newMessagesE);

    // this.claimsContract = new ClaimsContract(this.contractAddress, this.contract, this.web3Service, this.transactionService);
    // To check if user tokens are enough to submit transactions.
    if (this.user && this.user.role !== ROLES.SUPER_USER) {
      await this.claimsContract.getTransactionPrice().then(price => {
        this.price = Number(price);
        this.allowTransactionSubmissions = this.price <= this.user.tokens;
        // console.log('ShellComponent says user tokens are ', this.user.tokens, ', transaction price is ', this.price,
        //     ' and allowTransactionSubmissions is ', this.allowTransactionSubmissions);
      });
    }
  }

  public async renewUserRights() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const userBc = await this.userContract.getMe();
    const user: UserModel = {
      creationDate: userBc.creationDate,
      firstName: userBc.firstName,
      lastName: userBc.lastName,
      role: userBc.role,
      requestId: userBc.requestId,
      status: userBc.status,
      memberId: userBc.memberId,
      owner: userBc.owner,
      cmo: userBc.cmo,
      groups: userBc.groups,
      tokens: userBc.tokens
    };
    // console.log('FROM RENEW USER GROUP RIGHTS: ');
    // console.log(user);
    this.applicationDatabaseService.set(APPLICATION_DATA_CONSTANTS.USER, user);
    // this.store.dispatch(new fromUserActions.AddUserSuccess(user));
    this.store.dispatch(new fromMemberActions.SelectMember(user.memberId));
    // @ts-ignore
    this.user = user;
    // console.log(this.user);
  }

  public newMessagesGet() {
    // this.unreadMessages = this.inboxComponent.unreadMessages;
    return newMessagesE;
  }

  public newMessagesSet(no: number) {
    newMessagesE = no !== 0;
    this.unreadMessages = no;
  }

  public newMessagesCheckFalse() {
    if (this.unreadMessages === 0) {
      newMessagesE = false;
    }
    // this.unreadMessages = 0;
  }

  public ngOnDestroy() {
    this.theme$.unsubscribe();
    this.user$.unsubscribe();
    this.member$.unsubscribe();
    if (this.newMessagesInterval$) {
      this.newMessagesInterval$.unsubscribe();
    }
    // this.garbageCollector();
  }

  private findChildRoute(route): Route {
    if (route.firstChild === null) {
      return route;
    } else {
      return this.findChildRoute(route.firstChild);
    }
  }

  private loadBackButton(event) {
    this.bloBackButton.viewContainerRef.clear();
    if (event.shellOptions && event.shellOptions.hasBackButton) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackButtonShellComponent);
      this.bloBackButton.viewContainerRef.createComponent(componentFactory);
    }
  }

  private loadAuxiliarOptions(event) {
    this.bloButtons.viewContainerRef.clear();
    if (event.shellOptions && event.shellOptions.auxiliarOptionsComponent) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(event.shellOptions.auxiliarOptionsComponent);
      this.bloButtons.viewContainerRef.createComponent(componentFactory);
    }
  }

  get title(): string {
    return this.titleService.getTitle();
  }

  get isMobile(): boolean {
    return this.media.isActive('xs') || this.media.isActive('sm');
  }

  private _themeChanges(theme) {
    switch (theme) {
      case 'bloomen-blue-app-theme-light':
        this.backgroundImage = 'img_header_blue.png';
        break;
      case 'bloomen-green-app-theme-light':
        this.backgroundImage = 'img_header_green.png';
        break;
      case 'bloomen-lilac-app-theme-dark':
        this.backgroundImage = 'img_header_lilac.png';
        break;
      case 'bloomen-orange-app-theme-light':
        this.backgroundImage = 'img_header_orange.png';
        break;
      default:
    }
  }

  public openDialogAddMember() {
    this.matDialog.open(AddMemberDialogComponent, {
      width: '1100px',
    });
  }

  public garbageCollector() {
    console.log(this.uploadedCSV2JSON, this.objs, this.chunks, this.claimsArray);
    this.uploadedCSV2JSON = undefined;
    this.objs = undefined;
    this.chunks = undefined;
    this.claimsArray = undefined;
  }

  public openInput() {
    document.getElementById('uploadFile2').click();
  }

  public uploadFile2(event) {
      const file = event.target.files;
      if (file.length > 0) {
        // console.log('SEE THE FILE', file); // You will see the file
        this.matDialog.open(AddMemberDialogComponent, {
            data: {
                papa: true
            }
        });
        const f = new Blob(file, {type: 'text/plain'});
        const reader = new FileReader();
        reader.onload = async () => {
          const text = reader.result;
          const papa = Papa.parse(text, {
            // noProgressBar: false,
            transform: function (value) {
              try {
                // console.log('in Papa.transform');
                return JSON.parse(value);
              } catch (err) {
                return value;
              }
            }
          });
          let rightCSVFormat = true;
          papa.data.forEach((x: any) => {
            if (x.length !== 9) {
              console.log('CSV has wrong information. An odd line is printed for feedback:', x);
              rightCSVFormat = false;
            }
          });
          if (rightCSVFormat) {
            // this.matDialog.closeAll();
            this.uploadedCSV2JSON = this.csvJSON(papa.data);
            if (this.uploadedCSV2JSON === '') {
              return;
            }

            // Start of chunk splitting
            this.count = 0;
            interface MyJSON {
              isc: string;
              countries: string;
              startDate: Number;
              endDate: Number;
              types: string;
              splitPart: Number;
              rightHolderRole: string;
              rightHolderProprietaryID: Number;
              title: string;
            }
            this.objs = JSON.parse(this.uploadedCSV2JSON) as MyJSON[];
            this.uploadedCSV2JSON = undefined;
            const memberOwner = Number(this.user.memberId);
            const claimsArray = [];
            for (const cl of this.objs) {
              let c: ClaimModel;
              if (!cl.rightHolderProprietaryID) {
                this.objs.forEach(o => o.rightHolderProprietaryID = Number(0));
                // objs.forEach(o => console.log(o.rightHolderProprietaryID));
              }
              switch (cl.rightHolderRole) {
                case '': {
                  // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
                  c = {
                    creationDate: new Date().getTime(),
                    lastChange: new Date().getTime(),
                    messageLog: [''],
                    claimId: undefined,
                    claimType: ClaimTypeEnum.SOUND_RECORDING,
                    memberOwner: memberOwner,
                    status: ClaimModel.StatusClaimEnum.CLAIMED,
                    oldClaimData: [
                      ['ISRC', cl.isc],
                      ['countries', cl.countries],
                      ['startDate', cl.startDate],
                      ['endDate', cl.endDate],
                      ['useTypes', cl.types],
                      ['splitPart', cl.splitPart],
                      ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
                      ['title', cl.title]
                    ],
                    claimData: [
                      ['ISRC', cl.isc],
                      ['countries', cl.countries],
                      ['startDate', cl.startDate],
                      ['endDate', cl.endDate],
                      ['useTypes', cl.types],
                      ['splitPart', cl.splitPart],
                      ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
                      ['title', cl.title]
                    ]
                  };
                  break;
                }
                default: {
                  // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
                  c = {
                    creationDate: new Date().getTime(),
                    lastChange: new Date().getTime(),
                    messageLog: [''],
                    claimId: undefined,
                    claimType: ClaimTypeEnum.MUSICAL_WORK,
                    memberOwner: memberOwner,
                    status: ClaimModel.StatusClaimEnum.CLAIMED,
                    oldClaimData: [
                      ['ISWC', cl.isc],
                      ['countries', cl.countries],
                      ['startDate', cl.startDate],
                      ['endDate', cl.endDate],
                      ['rightTypes', cl.types],
                      ['splitPart', cl.splitPart],
                      ['rightHolderRole', cl.rightHolderRole],
                      ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
                      ['title', cl.title]
                    ],
                    claimData: [
                      ['ISWC', cl.isc],
                      ['countries', cl.countries],
                      ['startDate', cl.startDate],
                      ['endDate', cl.endDate],
                      ['rightTypes', cl.types],
                      ['splitPart', cl.splitPart],
                      ['rightHolderRole', cl.rightHolderRole],
                      ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
                      ['title', cl.title]
                    ]
                  };
                  break;
                }
              }
              claimsArray.push(c);
            }
            this.objs = undefined;
            this.matDialog.closeAll();
            this.firstDiv = claimsArray.length > 10000 ? 10000 : 100;
            this.secondDiv = claimsArray.length > 10000 ? 100 : 1;
            // let claimsToResubmit = [];
            let claimIndex;

// Blockchain is not suitable for storing large amounts of data.
// The initial principles in which this application was based are meant for testing and not for production.
// Serious developing with different code organization and quality is needed in order to build a decentralized
// application that supports these features.
// Having tens of thousands of records in a single smart contract structure is impossible in this version.
// For security reasons, there are times when uploading claims that Alastria blocks the in batch transaction
// submission if it inspects increased traffic from a single account. New claims should be submitted after some time
// when rejected. The longer time, the better trust is built with Alastria.
            for (claimIndex = 0; claimIndex < claimsArray.length; claimIndex++) {
              const i = claimIndex;
              // let leave = false;
              await this.claimsContract.addClaim(claimsArray[claimIndex])
                  .then(() => {
                    if (((i + 1) % 100) === 0) {
                      console.log('Submitted the', i + 1, ((i + 1) % 10 === 1 && (i + 1) !== 11) ? 'st claim.'
                              : (((i + 1) % 10 === 2 && (i + 1) !== 12) ? 'nd claim.'
                              : (((i + 1) % 10 === 3 && (i + 1) !== 13) ? 'rd claim.' : 'th claim.')));
                    }
                  });
              //     .catch(() => {
              //       leave = true;
              //       claimsToResubmit = claimsArray.slice(claimIndex);
              //     });
              // if (leave) {
              //   break;
              // }
            }
            // for (let i = 0; i < claimsToResubmit.length; i++) {
            //   await this.claimsContract.addClaim(claimsToResubmit[i])
            //       .then(() => {
            //         if (((i + 1) % 1) === 0) {
            //           console.log('Resubmitted a', i + 1, ((i + 1) % 10 === 1 && (i + 1) !== 11) ? 'st claim.'
            //                   : (((i + 1) % 10 === 2 && (i + 1) !== 12) ? 'nd claim.'
            //                   : (((i + 1) % 10 === 3 && (i + 1) !== 13) ? 'rd claim.' : 'th claim.')));
            //         }
            //       });
            // }
            // claimsToResubmit = [];
            this.router.navigate(['inbox']).then(() => {
              this.router.navigate(['claims']).then(() => {}); });
          } else {
            console.log('CSV has wrong information.');
            alert('E r r o r: The uploaded CSV file has an undesired format.\n\n' +
                'Please make sure each claim has 9 fields and that there are no empty lines.');
          }
        };
        reader.readAsText(f);
      }
  }

  public async uploadFile(event) {
    const file = event.target.files;
    if (file.length > 0) {
      // console.log(file); // You will see the file
      // console.log('before Blob');
      this.matDialog.open(AddMemberDialogComponent, {
        data: {
          papa: true
        }
      });
      const f = new Blob(file, {type: 'text/plain'});
      // console.log('after Blob');
      const reader = new FileReader();
      reader.onload = async () => {
        const text = reader.result;
        // console.log('CSV file:\n', (text as string).substring(0, 1000) + '...');
        // console.log('before Papa');
        const papa = Papa.parse(text, {
          // noProgressBar: false,
          transform: function (value) {
            try {
              // console.log('in Papa.transform');
              return JSON.parse(value);
            } catch (err) {
              return value;
            }
          }
        });
        // console.log('before rightCSVFormat');
        let rightCSVFormat = true;
        papa.data.forEach((x: any) => {
          if (x.length !== 9) {
            console.log('CSV has wrong information. An odd line is printed for feedback:', x);
            rightCSVFormat = false;
          }
        });
        if (rightCSVFormat) {
          // this.matDialog.closeAll();
          this.uploadedCSV2JSON = this.csvJSON(papa.data);
          if (this.uploadedCSV2JSON === '') {
            return;
          }
          // // Start of chunk splitting
          // Promise.resolve('ok')
          //     .then(async () => {
          this.count = 0;
          interface MyJSON {
            isc: string;
            countries: string;
            startDate: Number;
            endDate: Number;
            types: string;
            splitPart: Number;
            rightHolderRole: string;
            rightHolderProprietaryID: Number;
            title: string;
          }
          this.objs = JSON.parse(this.uploadedCSV2JSON) as MyJSON[];
          this.uploadedCSV2JSON = undefined;
          this.matDialog.closeAll();
          this.insertedClaimsCount = -1;
          if (this.objs.length * this.price > this.user.tokens) {
            this.assetCardComponent.alertUser2(this.user.tokens, this.price);
            this.insertedClaimsCount = 1;
            this.maxInsertedClaimsCount = this.user.tokens / this.price;
          }

          this.lastChunk = 0;
          this.lastToSubmitClaimFromChunk = 0;
          while (this.count < this.objs.length) { // } && prevCount <= this.count) {
            // await new Promise(resolve => setTimeout(resolve, 5000));
            console.log(this.uploadedCSV2JSON, this.objs, this.chunks, this.claimsArray);
            this.claimsToResubmit = [];
            await this.splitInChunks(this.lastChunk, this.lastToSubmitClaimFromChunk)
                .catch(() => { console.log('CATCH splitInChunks(', this.lastChunk, this.lastToSubmitClaimFromChunk, ')'); });
            console.log('Till now loaded', this.count, 'out of', this.objs.length, 'claims.');

            while (this.claimsToResubmit.length) {
              console.log('(claimsToResubmit.length)', this.claimsToResubmit.length, '> 0');
              const tempclaimsToResubmit = this.claimsToResubmit;
              this.claimsToResubmit = [];
              await this.submitAll(tempclaimsToResubmit, 0);
            }
            console.log('Uploaded entire chunk', this.lastChunk,
                'with (claimsToResubmit.length)', this.claimsToResubmit.length, '= 0');
            // if (prevCount === this.count) {
            // break;
            // }
            // prevCount = this.count;
          }
          this.router.navigate(['inbox']).then(() => {
            this.router.navigate(['claims']).then(() => {}); });

          // this.garbageCollector()
          // await this.splitInChunks(0, 0)
          //     .then(async () => { console.log('splitInChunks(0,0).THEN'); await this.recalcUploading(); })
          //     .catch(async () => {console.log('splitInChunks(0,0).CATCH'); await this.recalcUploading(); });

          // console.log('recalcUploading() AFTER splitInChunks(0,0)');
          // await this.recalcUploading();
          // if (index >= this.objs.length) {
          //   console.log('index > this.objs.length');
          // }
          // })
          //     .then(() => {
          // });
          // })
          // .then(async () => {
          //   // Refresh Claims page: claims.component
          //   this.dataSource = new ClaimsDataSource(this.claimsContract);
          //   this.dataSource.loadClaims();
          // })
          // .then(() => {
          //   this.router.navigate(['inbox'])
          //       .then(() => {
          //         this.router.navigate(['claims']).then();
          //       }).then(async () => {
          //         console.log('AFTER router navigation');
          //         await this.recalcUploading();
          //   });
          // });
        } else {
          console.log('CSV has wrong information.');
          alert('E r r o r: The uploaded CSV file has an undesired format.\n\n' +
              'Please make sure each claim has 9 fields and that there are no empty lines.');
        }
      };
      reader.readAsText(f);
    }
    // this.event = undefined;
    // this.csvForm.get('csv').setValue(this.event);
  }

  public async splitInChunks(_chunkCount, _claimPosition) {
    this.lineOffset = 1000;
    let index;
    let chunkCount = _chunkCount;
    this.chunks = [];
    for (index = _claimPosition; index < this.objs.length; index += this.lineOffset) {
      this.chunks[chunkCount] = [];
      for (let i = index; i < index + this.lineOffset; i++) {
        if (i < this.objs.length) {
          this.chunks[chunkCount].push((this.objs)[i]);
        }
      }
      // console.log('Claims to insert: from', index, 'to ', index + lineOffset, chunk);
      // if (index + lineOffset > this.uploadedCSV2JSON.length) {
      // break;
      // }
      // this.assetCardComponent.ngOnInit().then();
      // this.assetCardComponent.repertoireBulkUpload(this.uploadedCSV2JSON, this.price, this.user.tokens)
      // this.assetCardComponent.repertoireBulkUpload(this.uploadedCSV2JSON, this.price, this.user.tokens);
      // console.log('GLOBAL ALL ASSETS');
      console.log('chunk No', chunkCount);
      this.lastToSubmitClaimFromChunk = 0;
      await this.uploadChunk(this.chunks[chunkCount], chunkCount).then(async () => {
        // while (this.lastToSubmitClaimFromChunk !== 0 && this.claimsToResubmit.length) {
        //   console.log('(lastToSubmitClaimFromChunk+1)', this.lastToSubmitClaimFromChunk + 1, '<> 0');
        //   await this.submitAll(this.claimsArray, ++this.lastToSubmitClaimFromChunk);
        // }
        console.log('We have uploaded', this.count += this.chunks[chunkCount].length - this.claimsToResubmit.length,
            '/', this.objs.length, 'claims.');
        chunkCount++;
      })
          .catch(() => { console.log('CATCH uploadChunk(', this.chunks[chunkCount], chunkCount, ')'); });
    } // End of chunk splitting
  }

  public async uploadChunk(chunk, chunkNumber) {
    this.lastChunk = chunkNumber;
    let done = false;
    const memberOwner = Number(this.user.memberId);
    const claimsArray = [];
    for (const cl of chunk) {
      let c: ClaimModel;
      if (!cl.rightHolderProprietaryID) {
        chunk.forEach(o => o.rightHolderProprietaryID = Number(0));
        // objs.forEach(o => console.log(o.rightHolderProprietaryID));
      }
      switch (cl.rightHolderRole) {
        case '': {
          // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
          c = {
            creationDate: new Date().getTime(),
            lastChange: new Date().getTime(),
            messageLog: [''],
            claimId: undefined,
            claimType: ClaimTypeEnum.SOUND_RECORDING,
            memberOwner: memberOwner,
            status: ClaimModel.StatusClaimEnum.CLAIMED,
            oldClaimData: [
              ['ISRC', cl.isc],
              ['countries', cl.countries],
              ['startDate', cl.startDate],
              ['endDate', cl.endDate],
              ['useTypes', cl.types],
              ['splitPart', cl.splitPart],
              ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
              ['title', cl.title]
            ],
            claimData: [
              ['ISRC', cl.isc],
              ['countries', cl.countries],
              ['startDate', cl.startDate],
              ['endDate', cl.endDate],
              ['useTypes', cl.types],
              ['splitPart', cl.splitPart],
              ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
              ['title', cl.title]
            ]
          };
          break;
        }
        default: {
          // console.log('cl.rightHolderRole: ', cl.rightHolderRole);
          c = {
            creationDate: new Date().getTime(),
            lastChange: new Date().getTime(),
            messageLog: [''],
            claimId: undefined,
            claimType: ClaimTypeEnum.MUSICAL_WORK,
            memberOwner: memberOwner,
            status: ClaimModel.StatusClaimEnum.CLAIMED,
            oldClaimData: [
              ['ISWC', cl.isc],
              ['countries', cl.countries],
              ['startDate', cl.startDate],
              ['endDate', cl.endDate],
              ['rightTypes', cl.types],
              ['splitPart', cl.splitPart],
              ['rightHolderRole', cl.rightHolderRole],
              ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
              ['title', cl.title]
            ],
            claimData: [
              ['ISWC', cl.isc],
              ['countries', cl.countries],
              ['startDate', cl.startDate],
              ['endDate', cl.endDate],
              ['rightTypes', cl.types],
              ['splitPart', cl.splitPart],
              ['rightHolderRole', cl.rightHolderRole],
              ['rightHolderProprietaryID', cl.rightHolderProprietaryID.toString()],
              ['title', cl.title]
            ]
          };
          break;
        }
      }
      claimsArray.push(c);
    }
    if (!done) {
      done = true;
      this.claimsArray = claimsArray;
      // console.log('claimsArray: ', claimsArray);
      await this.submitAll(claimsArray, 0);
    }
  }

  public async submitAll(claimsArray, _lastToSubmitClaimFromChunk) {
    let tempFulfilled;
    this.lastToSubmitClaimFromChunk = _lastToSubmitClaimFromChunk;
    for (let j = this.lastToSubmitClaimFromChunk; j < claimsArray.length; j++) {
      //       if (this.price > this.user.tokens) {
      //         this.alertUser();
      //       }
      //       if (this.insertedClaimsCount >= 0 && this.insertedClaimsCount <= this.maxInsertedClaimsCount) {
      if (((j + 1) % 50) === 0) {
      console.log('Trying to submit claim', j + 1, 'of chunk', this.lastChunk);
      } else
      if (claimsArray.length < this.lineOffset &&
          claimsArray.length < this.objs.length && !this.claimsToResubmit.length) {
        console.log('... another claim of chunk', this.lastChunk, 'that failed before.');
      }
      this.lastToSubmitClaimFromChunk = j; // + this.lastChunk * this.lineOffset;
      tempFulfilled = true;
      await this.claimsContract.addClaim(claimsArray[j]).then(() => {
        if (j < claimsArray.length - 1) {
          this.lastToSubmitClaimFromChunk = j + 1; // + this.lastChunk * this.lineOffset;
        } else {
          this.lastToSubmitClaimFromChunk = 0; // this.lastChunk * this.lineOffset;
          this.lastChunk++;
        }
        // process.stdout.write(j.toString() + ' ');
        // console.log('Claim No', j + 1, 'of', claimsArray.length, ' was added successfully:\n');
        //           this.insertedClaimsCount++; // count of next
        //           // console.log(this.insertedClaimsCount);
        //         });
        //         // console.log(this.insertedClaimsCount);
        //       } else if (this.insertedClaimsCount === -1) {
        //         await this.claimsContract.addClaim(claimsArray[j]).then(() => {
        //           console.log('Claim No', j + 1, ' of', claimsArray.length,
        //               ' was added successfully:\n', claimsArray[j]);
      })
          .catch(() => {
            console.log('CATCH addClaim(claimsArray[', j, ']');
            tempFulfilled = false;
            for (let i = j; i < this.claimsArray.length; i++) {
              this.claimsToResubmit.push(claimsArray[i]);
            }
          });
      if (!tempFulfilled) {
        break;
      }
      // await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!tempFulfilled) {
      // await this.submitAll(claimsArray, ++this.lastToSubmitClaimFromChunk);
    }
  }

  public csvJSON(csv) {
    const result = [];
    const line = csv;
    const headers = line[0];
    // must be isc,countries,startDate,endDate,types,splitPart,rightHolderRole,rightHolderProprietaryID,title
    if (headers[0] !== 'isc' || headers[1] !== 'countries' || headers[2] !== 'startDate' || headers[3] !== 'endDate' ||
        headers[4] !== 'types' || headers[5] !== 'splitPart' || headers[6] !== 'rightHolderRole' ||
        headers[7] !== 'rightHolderProprietaryID' || headers[8] !== 'title'
    ) {
      alert('Please upload a valid file with headers: \n' +
          '\'isc,countries,startDate,endDate,types,splitPart,rightHolderRole,' +
          'rightHolderProprietaryID,title\'\n');
      return '';
    } else {
      for (let i = 1; i < line.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          const currentline = line[i];
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

  public alertUser() {
    alert('Bloomen Decentralized Management App:\n\n\nYou do not have enough tokens to file claim changes.\n\n' +
        'Please refer to your Administrator or CMO.');
  }

}
