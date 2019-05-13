// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';
import { ClaimsRoutingModule } from './claims-routing.module';
import { ShellModule } from '@shell/shell.module';

// Home
import { ClaimsComponent } from './claims.component';

// Services
import { UserProfileShellModule } from '@components/user-profile-shell/user-profile-shell.module';
import { MusicalDialogModule } from '@components/claim-dialog/musical-dialog/musical-dialog.module';
import { SoundDialogModule } from '@components/claim-dialog/sound-dialog/sound-dialog.module';

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
    ClaimsRoutingModule,
    ShellModule,
    UserProfileShellModule,
    MusicalDialogModule,
    SoundDialogModule
  ],
  declarations: [ClaimsComponent]
})
export class ClaimsModule { }
