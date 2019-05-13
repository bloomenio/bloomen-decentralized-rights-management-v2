import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { memberReducer } from './member.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MemberEffects } from './member.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('members', memberReducer),
        EffectsModule.forFeature([
            MemberEffects
        ])
    ]
})

export class MemberStoreModule { }
