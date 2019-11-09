// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '@app/material.module';

// Services
import { ReactiveFormsModule } from '@angular/forms';
import { AddClaimDialogComponent } from '@components/add-claim-dialog/add-claim-dialog.component';
import {AddSoundRecordingModule} from '@components/add-sound/add-sound-recording.module';
import {AddMusicalWorkModule} from '@components/add-musical/add-musical-work.module';

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
    ReactiveFormsModule,
    AddMusicalWorkModule,
    AddSoundRecordingModule
  ],
  declarations: [AddClaimDialogComponent],
  providers: [AddClaimDialogComponent],
  entryComponents: [AddClaimDialogComponent]
})
export class AddClaimDialogModule { }
