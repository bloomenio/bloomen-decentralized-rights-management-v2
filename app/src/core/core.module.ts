import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import { environment } from '@env/environment';

import { RouteReusableStrategy } from './router/route-reusable-strategy';
import { CustomSerializer } from './router/custom-serializer';

import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@services/i18n/i18n.service';
import { HttpService } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { RouterStateSerializer } from '@ngrx/router-store';

import { Web3Service } from '@services/web3/web3.service';
import { TransactionService } from '@services/web3/transactions/transaction.service';
import { MemberContract, UserContract, ClaimsContract, RegistryContract, FunctionsContract } from '@services/web3/contracts';

import { reducers, metaReducers } from './core.state';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule,
    RouterModule,
    TranslateModule.forRoot(),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    environment.production ? [] : StoreDevtoolsModule.instrument({
      name: 'BloomenApp'
    }),
  ],
  providers: [
    Web3Service,
    {
      provide: TransactionService,
      useClass: TransactionService,
      deps: [Web3Service]
    },
    I18nService,
    HttpCacheService,
    ApiPrefixInterceptor,
    ErrorHandlerInterceptor,
    CacheInterceptor,
    { provide: HttpClient, useClass: HttpService },
    { provide: RouteReuseStrategy, useClass: RouteReusableStrategy },
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    {
      provide: MemberContract,
      useFactory: genericContractFactory(MemberContract),
      deps: [Web3Service, TransactionService]
    },
    {
      provide: UserContract,
      useFactory: genericContractFactory(UserContract),
      deps: [Web3Service, TransactionService]
    },
    {
      provide: ClaimsContract,
      useFactory: genericContractFactory(ClaimsContract),
      deps: [Web3Service, TransactionService]
    },
    {
      provide: RegistryContract,
      useFactory: genericContractFactory(RegistryContract),
      deps: [Web3Service, TransactionService]
    },
    {
      provide: FunctionsContract,
      useFactory: genericContractFactory(FunctionsContract),
      deps: [Web3Service, TransactionService]
    },
  ]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    // Import guard
    if (parentModule) {
      throw new Error(
        `${parentModule} has already been loaded. Import Core module in the AppModule only.`
      );
    }
  }
}

export function genericContractFactory(type: any) {
  return (web3Service: Web3Service, transactionService: TransactionService) => {
    // TODO: allow contract address per environment... or maybe network?
    const mycontract = web3Service.createContract(type.ABI, type.ADDRESS);
    return new type(type.ADDRESS, mycontract, web3Service, transactionService);
  };

}

export * from '@services/web3/contracts';
