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
import {interval, Subscription} from 'rxjs';
import * as Papa from 'papaparse';
import {AssetCardComponent} from '@components/asset-card/asset-card.component';
import {ClaimsDataSource} from '@pages/claims/claims.datasource';
import {ClaimModel} from '@models/claim.model';
import {MemberModel} from '@models/member.model';
import {ClaimsContract} from '@services/web3/contracts';
// import {newMessages} from '@pages/inbox/inbox.component';
// import {AddClaimDialogComponent} from '@components/add-claim-dialog/add-claim-dialog.component';

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
  public userInitials: string;
  public roles: object;
  public theme$: Subscription;
  public user$: Subscription;
  public member$: Subscription;
  public currentPageRoute: string;

  @ViewChild(BloButtonsHostDirective) public bloButtons: BloButtonsHostDirective;
  @ViewChild(BloBackButtonHostDirective) public bloBackButton: BloBackButtonHostDirective;

  public claimType: any;

  // For Refresh Claims page.
  public dataSource: ClaimsDataSource;

  constructor(
    private titleService: Title,
    private store: Store<ApplicationDataStateModel>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private media: ObservableMedia,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public assetCardComponent: AssetCardComponent,
    private matDialog: MatDialog,
    public claimsContract: ClaimsContract
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

  public ngOnInit() {
    this.roles = ROLES;

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
  public openInput() {
    document.getElementById('fileInput').click();
  }
  public uploadFile(event) {
    const file = event.target.files;
    if (file.length > 0) {
      console.log(file); // You will see the file
      //
      const f = new Blob(file, {type: 'text/plain'});
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        // console.log('CSV file:\n', (text as string).substring(0, 1000) + '...');
        // console.log('Papa');
        const papa = Papa.parse(text, {
          transform: function (value) {
            try {
              return JSON.parse(value);
            } catch (err) {
              return value;
            }
          }
        });
        // console.log('CSV.DATA PAPAPARSE:');
        let rightCSVFormat = true;
        papa.data.forEach( (x: any) => { if (x.length !== 9) {
          console.log('CSV HAS WRONG INFO.');
          rightCSVFormat = false;
        }});
        if (rightCSVFormat) {
          console.log(this.csvJSON(papa.data));
          this.uploadedCSV2JSON = this.csvJSON(papa.data);
          // tslint:disable-next-line:no-life-cycle-call
          this.assetCardComponent.ngOnInit();
          this.assetCardComponent.repertoireBulkUpload(this.uploadedCSV2JSON).then( () => {
            console.log('this.uploadedCSV2JSON:\n', this.uploadedCSV2JSON);

            // Refresh Claims page: claims.component
            this.dataSource = new ClaimsDataSource(this.claimsContract);
            this.dataSource.loadClaims();
          }).then(() => {
            this.router.navigateByUrl('/repertoire')
                .then(() => {
                  this.router.navigateByUrl('/claims');
                });
          });
          // End Of Refresh Claims page: claims.component

        } else {
          console.log('E r r o r: CSV HAS WRONG INFO.');
          alert('E r r o r: The uploaded CSV file has an undesired format.\n\n' +
              // 'Right Holder Role spot is left empty for Sound Recordings\n' +
              'Please make sure each claim has 9 fields and that there are no empty lines.');
        }
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
