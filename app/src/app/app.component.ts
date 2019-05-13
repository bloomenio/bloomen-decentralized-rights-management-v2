import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { merge, Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { I18nService } from '@services/i18n/i18n.service';
import { Logger } from '@services/logger/logger.service';

import { Store, select } from '@ngrx/store';

import * as fromSelectors from '@stores/application-data/application-data.selectors';

import { ApplicationDataStateModel } from '@core/models/application-data-state.model';
import { TransactionService, Transaction } from '@services/web3/transactions/transaction.service';

const log = new Logger('App');

@Component({
  selector: 'blo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public theme$: Observable<string>;
  public mnemonic$: Subscription;

  public isLoading: boolean;

  private transactionSubscription: Subscription;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private i18nService: I18nService,
    private store: Store<ApplicationDataStateModel>,
    private transactionService: TransactionService,
  ) { }

  public ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    this.isLoading = false;
    this.register();

    this.theme$ = this.store.pipe(select(fromSelectors.getTheme));

    // Setup translations
    this.i18nService.init(
      environment.defaultLanguage,
      environment.supportedLanguages
    );

    const onNavigationEnd = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    );

    // Change page title on navigation or language change, based on route data
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        }
      });
  }

  private register() {
    this.transactionSubscription = this.transactionService
      .getTransactions().subscribe((transactions: Transaction[]) => {
        this.isLoading = transactions.length > 0;
      });
  }

  public ngOnDestroy() {
    this.transactionSubscription.unsubscribe();
  }
}
