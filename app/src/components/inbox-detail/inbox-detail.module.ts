// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { InboxDetailComponent } from './inbox-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import {ClaimsComponent} from '@pages/claims/claims.component';
import {SoundDialogComponent} from '@components/claim-dialog/sound-dialog/sound-dialog.component';
import {MusicalDialogComponent} from '@components/claim-dialog/musical-dialog/musical-dialog.component';
import {SoundDialogModule} from '@components/claim-dialog/sound-dialog/sound-dialog.module';
import {MusicalDialogModule} from '@components/claim-dialog/musical-dialog/musical-dialog.module';
import {InboxComponent} from '@pages/inbox/inbox.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    SoundDialogModule,
    MusicalDialogModule
  ],
  declarations: [InboxDetailComponent],
  exports: [InboxDetailComponent, SoundDialogComponent, MusicalDialogComponent],
  entryComponents: [InboxDetailComponent],
  providers: [ClaimsComponent, InboxComponent]
})
export class InboxDetailModule { }
