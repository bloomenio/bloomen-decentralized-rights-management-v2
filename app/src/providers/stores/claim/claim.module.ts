import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { claimReducer } from './claim.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ClaimEffects } from './claim.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('claim', claimReducer),
        EffectsModule.forFeature([
            ClaimEffects
        ])
    ]
})

export class ClaimStoreModule { }
