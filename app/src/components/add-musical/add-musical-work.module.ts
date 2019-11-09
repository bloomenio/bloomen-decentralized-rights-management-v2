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
import { AddMusicalWorkComponent } from '@components/add-musical/add-musical-work.component';

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
    ReactiveFormsModule
  ],
  declarations: [AddMusicalWorkComponent],
  providers: [AddMusicalWorkComponent],
  entryComponents: [AddMusicalWorkComponent]
})
export class AddMusicalWorkModule { }
