import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { cmosReducer } from './cmos.reducer';
import { EffectsModule } from '@ngrx/effects';
import { CmosEffects } from './cmos.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('cmos', cmosReducer),
        EffectsModule.forFeature([
            CmosEffects
        ])
    ]
})

export class CmosStoreModule { }
