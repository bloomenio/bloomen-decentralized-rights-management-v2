import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { mnemonicReducer } from './mnemonic.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MnemonicEffects } from './mnemonic.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('mnemonic', mnemonicReducer),
        EffectsModule.forFeature([
            MnemonicEffects
        ])
    ]
})

export class MnemonicStoreModule { }
