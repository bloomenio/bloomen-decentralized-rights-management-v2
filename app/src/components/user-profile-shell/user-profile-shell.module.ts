// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { UserProfileShellComponent } from './user-profile-shell.component';
import {DialogUserDataModule} from '@components/dialog-user-data/dialog-user-data.module';
import {DialogSuperUserModule} from '@components/dialog-super-user/dialog-super-user.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    DialogSuperUserModule
  ],
  declarations: [UserProfileShellComponent],
  exports: [UserProfileShellComponent],
  entryComponents: [UserProfileShellComponent]
})
export class UserProfileShellModule { }
