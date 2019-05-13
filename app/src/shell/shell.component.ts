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
import { Subscription } from 'rxjs';

const log = new Logger('blo-shell');

@Component({
  selector: 'blo-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {

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

  constructor(
    private titleService: Title,
    private store: Store<ApplicationDataStateModel>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private media: ObservableMedia,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog
  ) {
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
  }


  public ngOnDestroy() {
    this.theme$.unsubscribe();
    this.user$.unsubscribe();
    this.member$.unsubscribe();
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
}
