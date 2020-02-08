import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { repertoireReducer } from './repertoire.reducer';
import { EffectsModule } from '@ngrx/effects';
import {globalAllAssets, RepertoireEffects} from './repertoire.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('repertoire', repertoireReducer),
        EffectsModule.forFeature([
            RepertoireEffects
        ])
    ]
})

export class RepertoireStoreModule { }
export { globalAllAssets };
