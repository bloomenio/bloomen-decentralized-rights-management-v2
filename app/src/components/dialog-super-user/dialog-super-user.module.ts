// Basic
import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { ShellModule } from '@shell/shell.module';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';
import {ReactiveFormsModule} from '@angular/forms';
import {DialogSuperUserComponent} from '@components/dialog-super-user/dialog-super-user.component';

/**
 * Module to import and export all the components for the home page.
 */
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    ShellModule,
    // UserProfileShellModule,
    ReactiveFormsModule
  ],
  declarations: [DialogSuperUserComponent],
  providers: [DialogSuperUserComponent, DatePipe],
  entryComponents: [DialogSuperUserComponent]
})
export class DialogSuperUserModule { }
