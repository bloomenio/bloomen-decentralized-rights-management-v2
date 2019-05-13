import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { applicationDataReducer } from './application-data.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ApplicationDataEffects } from './application-data.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('applicationData', applicationDataReducer),
        EffectsModule.forFeature([
            ApplicationDataEffects
        ])
    ]
})

export class ApplicationDataStoreModule { }
