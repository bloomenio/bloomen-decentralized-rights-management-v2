// Basic
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { MaterialModule } from '@app/material.module';

// Components
import { AssetCardComponent } from './asset-card.component';

// Components
import { MusicalDialogModule } from '@components/claim-dialog/musical-dialog/musical-dialog.module';
import { SoundDialogModule } from '@components/claim-dialog/sound-dialog/sound-dialog.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FlexLayoutModule,
    MaterialModule,
    MusicalDialogModule,
    SoundDialogModule
  ],
  declarations: [AssetCardComponent],
  exports: [AssetCardComponent],
  entryComponents: [AssetCardComponent]
})
export class AssetCardModule { }
