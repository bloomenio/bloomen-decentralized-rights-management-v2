import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '@shared/shared.module';

import { userReducer } from './user.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './user.effects';

@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('user', userReducer),
        EffectsModule.forFeature([
            UserEffects
        ])
    ]
})

export class UserStoreModule { }
